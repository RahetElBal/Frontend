import { z } from 'zod';
import * as validator from 'validator';

// Export configured zod
export { z };

// ============================================
// VALIDATION MESSAGE SYSTEM
// ============================================

/**
 * Validation messages use a special format: "key:param1=value1,param2=value2"
 * This allows us to pass both the translation key AND parameters to the 
 * error display component, which then calls t() with proper interpolation.
 * 
 * Example: "validation.required:field=Nom" 
 * → Will be parsed and translated as t("validation.required", { field: "Nom" })
 * → Results in "Nom est obligatoire"
 */

/**
 * Creates a validation message with embedded parameters.
 * Format: "key:param1=value1,param2=value2"
 */
export function validationMsg(key: string, params?: Record<string, string | number>): string {
  if (!params || Object.keys(params).length === 0) {
    return key;
  }
  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(',');
  return `${key}:${paramStr}`;
}

/**
 * Parses a validation message and extracts key and params.
 * Input: "validation.required:field=Nom"
 * Output: { key: "validation.required", params: { field: "Nom" } }
 */
export function parseValidationMsg(message: string): { key: string; params: Record<string, string> } {
  const colonIndex = message.indexOf(':');
  
  if (colonIndex === -1) {
    return { key: message, params: {} };
  }
  
  const key = message.substring(0, colonIndex);
  const paramStr = message.substring(colonIndex + 1);
  
  const params: Record<string, string> = {};
  if (paramStr) {
    paramStr.split(',').forEach(pair => {
      const eqIndex = pair.indexOf('=');
      if (eqIndex !== -1) {
        const paramKey = pair.substring(0, eqIndex);
        const paramValue = pair.substring(eqIndex + 1);
        params[paramKey] = paramValue;
      }
    });
  }
  
  return { key, params };
}

// ============================================
// FIELD LABEL HELPERS
// ============================================

/**
 * Common field labels in French (can be extended per locale if needed).
 * These are the actual translated names, not translation keys.
 */
export const FIELD_LABELS = {
  // Common fields
  name: 'Nom',
  firstName: 'Prénom',
  lastName: 'Nom de famille',
  email: 'Email',
  phone: 'Téléphone',
  address: 'Adresse',
  password: 'Mot de passe',
  confirmPassword: 'Confirmation du mot de passe',
  
  // Business fields
  salonName: 'Nom du salon',
  description: 'Description',
  price: 'Prix',
  duration: 'Durée',
  category: 'Catégorie',
  reference: 'Référence',
  
  // Date/Time
  date: 'Date',
  time: 'Heure',
  startDate: 'Date de début',
  endDate: 'Date de fin',
  
  // Other
  notes: 'Notes',
  status: 'Statut',
  role: 'Rôle',
  salon: 'Salon',
  client: 'Client',
  service: 'Service',
  staff: 'Personnel',
  owner: 'Propriétaire',
} as const;

type FieldLabelKey = keyof typeof FIELD_LABELS;

/**
 * Get field label by key, or return the key itself if not found.
 */
export function getFieldLabel(key: string): string {
  return FIELD_LABELS[key as FieldLabelKey] || key;
}

// ============================================
// VALIDATION SCHEMA HELPERS
// ============================================

/**
 * Creates a required string field with proper error message.
 * 
 * @param fieldLabel - The human-readable field name (e.g., "Nom", "Email")
 * 
 * @example
 * const schema = z.object({
 *   name: requiredString("Nom"),
 *   email: requiredString("Email").email(emailError()),
 * });
 */
export function requiredString(fieldLabel: string) {
  const msg = validationMsg('validation.required', { field: fieldLabel });
  return z.string().min(1, { message: msg });
}

/**
 * Creates a required string using a field key from FIELD_LABELS.
 * 
 * @example
 * const schema = z.object({
 *   name: requiredField("name"), // Uses FIELD_LABELS.name = "Nom"
 * });
 */
export function requiredField(fieldKey: FieldLabelKey | string) {
  return requiredString(getFieldLabel(fieldKey));
}

/**
 * Creates an optional string that accepts empty strings.
 */
export function optionalString() {
  return z.string().optional().or(z.literal(''));
}

/**
 * Email validation error message.
 */
export function emailError(): string {
  return 'validation.string.email';
}

const trimString = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  return value.trim();
};

const trimOptionalString = (value: unknown): unknown => {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const isValidEmail = (value: string): boolean => validator.isEmail(value);

/**
 * Creates an email field (required).
 */
export function emailField(fieldLabel = 'Email') {
  return z.preprocess(
    trimString,
    requiredString(fieldLabel).refine((value) => isValidEmail(value), {
      message: emailError(),
    })
  );
}

/**
 * Creates an optional email field.
 */
export function optionalEmailField() {
  return z.preprocess(
    trimOptionalString,
    z
      .string()
      .refine((value) => isValidEmail(value), { message: emailError() })
      .optional()
  );
}

/**
 * Phone validation error message.
 */
export function phoneError(): string {
  return 'validation.custom.phoneInvalid';
}

/**
 * Creates a phone field (required).
 */
export function phoneField(fieldLabel = 'Téléphone') {
  return requiredString(fieldLabel).regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    { message: phoneError() }
  );
}

/**
 * Creates a min length error message.
 */
export function minLengthError(fieldLabel: string, min: number): string {
  return validationMsg('validation.string.min', { field: fieldLabel, min: min.toString() });
}

/**
 * Creates a password field with minimum length.
 */
export function passwordField(fieldLabel = 'Mot de passe', minLength = 8) {
  return requiredString(fieldLabel).min(minLength, {
    message: minLengthError(fieldLabel, minLength),
  });
}

/**
 * Creates a strong password field with complexity requirements.
 */
export function strongPasswordField(fieldLabel = 'Mot de passe') {
  return passwordField(fieldLabel, 8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'validation.custom.passwordWeak' }
  );
}

/**
 * Password mismatch error message.
 */
export function passwordMismatchError(): string {
  return 'validation.custom.passwordMismatch';
}

/**
 * Adds password match validation to a schema.
 */
export function withPasswordMatch<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  passwordFieldName = 'password',
  confirmFieldName = 'confirmPassword'
) {
  return schema.refine(
    (data) => {
      const d = data as Record<string, unknown>;
      return d[passwordFieldName] === d[confirmFieldName];
    },
    {
      message: passwordMismatchError(),
      path: [confirmFieldName],
    }
  );
}

/**
 * Creates a required number field.
 */
export function requiredNumber(fieldLabel: string) {
  const msg = validationMsg('validation.required', { field: fieldLabel });
  return z.number({ message: msg });
}

/**
 * Creates a positive number field.
 */
export function positiveNumber(fieldLabel: string) {
  return requiredNumber(fieldLabel).positive({
    message: validationMsg('validation.number.positive', { field: fieldLabel }),
  });
}

/**
 * Creates a select field (required, non-empty string).
 */
export function requiredSelect(fieldLabel: string) {
  const msg = validationMsg('validation.required', { field: fieldLabel });
  return z.string().min(1, { message: msg });
}

/**
 * Invalid selection error message.
 */
export function invalidSelectionError(): string {
  return 'validation.custom.invalidSelection';
}

/**
 * Creates a multi-select field with minimum items.
 */
export function multiSelectField(minItems = 1) {
  return z.array(z.string()).min(minItems, {
    message: validationMsg('validation.array.min', { min: minItems.toString() }),
  });
}

/**
 * Date validation error message.
 */
export function dateError(): string {
  return 'validation.date.invalid';
}

/**
 * Creates a date field.
 */
export function dateField() {
  return z.date({ message: dateError() });
}
