import { z } from 'zod';
import i18n from '@/i18n';

// Type for translation params
type TranslationParams = Record<string, string | number>;

// Helper to get translated message
function t(key: string, params?: TranslationParams): string {
  return i18n.t(key, params);
}

// Export configured zod
export { z };

// ============================================
// VALIDATION HELPERS
// ============================================

// Helper to create required string with i18n message
export function requiredString(fieldKey: string) {
  return z
    .string({ message: t('validation.required', { field: t(fieldKey) }) })
    .min(1, t('validation.required', { field: t(fieldKey) }));
}

// Helper to create optional string
export function optionalString() {
  return z.string().optional().or(z.literal(''));
}

// Helper to create email field
export function emailField(fieldKey = 'fields.email') {
  return requiredString(fieldKey).email(t('validation.string.email'));
}

// Helper to create phone field
export function phoneField(fieldKey = 'fields.phone') {
  return requiredString(fieldKey).regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    t('validation.custom.phoneInvalid')
  );
}

// Helper to create password field
export function passwordField(fieldKey = 'fields.password', minLength = 8) {
  return requiredString(fieldKey).min(
    minLength,
    t('validation.string.min', { field: t(fieldKey), min: minLength })
  );
}

// Helper to create strong password field
export function strongPasswordField(fieldKey = 'fields.password') {
  return requiredString(fieldKey)
    .min(8, t('validation.string.min', { field: t(fieldKey), min: 8 }))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      t('validation.custom.passwordWeak')
    );
}

// Helper to create confirm password field
export function confirmPasswordField(fieldKey = 'fields.confirmPassword') {
  return requiredString(fieldKey);
}

// Helper to add password match refinement to schema
export function withPasswordMatch<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  passwordField = 'password',
  confirmField = 'confirmPassword'
) {
  return schema.refine(
    (data) => {
      const d = data as Record<string, unknown>;
      return d[passwordField] === d[confirmField];
    },
    {
      message: t('validation.custom.passwordMismatch'),
      path: [confirmField],
    }
  );
}

// Helper to create date field
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function dateField(_fieldKey = 'fields.date') {
  return z.date({
    message: t('validation.date.invalid'),
  });
}

// Helper to create number field
export function numberField(fieldKey: string) {
  return z.number({
    message: t('validation.required', { field: t(fieldKey) }),
  });
}

// Helper to create positive number field
export function positiveNumberField(fieldKey: string) {
  return numberField(fieldKey).positive(
    t('validation.number.positive', { field: t(fieldKey) })
  );
}

// Helper to create select field (non-empty string)
export function selectField(fieldKey: string) {
  return z
    .string({ message: t('validation.required', { field: t(fieldKey) }) })
    .min(1, t('validation.custom.invalidSelection'));
}

// Helper to create multi-select field (non-empty array)
export function multiSelectField(minItems = 1) {
  return z
    .array(z.string())
    .min(minItems, t('validation.array.min', { min: minItems }));
}
