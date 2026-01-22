import { z } from 'zod';
import i18n from '@/i18n';

// Type for translation params
type TranslationParams = Record<string, string | number>;

// Helper to get translated message
function t(key: string, params?: TranslationParams): string {
  return i18n.t(key, params);
}

// Custom error map for zod that uses i18n
export const zodI18nErrorMap: z.ZodErrorMap = (issue, ctx) => {
  let message: string;

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') {
        message = t('validation.requiredField');
      } else {
        message = t('validation.requiredField');
      }
      break;

    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        message = t('validation.string.min', {
          field: ctx.data,
          min: issue.minimum as number,
        });
      } else if (issue.type === 'number') {
        message = t('validation.number.min', {
          field: ctx.data,
          min: issue.minimum as number,
        });
      } else if (issue.type === 'array') {
        message = t('validation.array.min', {
          min: issue.minimum as number,
        });
      } else {
        message = ctx.defaultError;
      }
      break;

    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        message = t('validation.string.max', {
          field: ctx.data,
          max: issue.maximum as number,
        });
      } else if (issue.type === 'number') {
        message = t('validation.number.max', {
          field: ctx.data,
          max: issue.maximum as number,
        });
      } else if (issue.type === 'array') {
        message = t('validation.array.max', {
          max: issue.maximum as number,
        });
      } else {
        message = ctx.defaultError;
      }
      break;

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        message = t('validation.string.email');
      } else if (issue.validation === 'url') {
        message = t('validation.string.url');
      } else if (issue.validation === 'uuid') {
        message = t('validation.string.uuid');
      } else {
        message = t('validation.string.regex', { field: ctx.data });
      }
      break;

    case z.ZodIssueCode.invalid_date:
      message = t('validation.date.invalid');
      break;

    case z.ZodIssueCode.custom:
      message = issue.message || ctx.defaultError;
      break;

    default:
      message = ctx.defaultError;
  }

  return { message };
};

// Initialize zod with custom error map
z.setErrorMap(zodI18nErrorMap);

// Export configured zod
export { z };

// ============================================
// VALIDATION HELPERS
// ============================================

// Helper to create required string with i18n message
export function requiredString(fieldKey: string) {
  return z.string({
    required_error: i18n.t('validation.required', { field: i18n.t(fieldKey) }),
  }).min(1, i18n.t('validation.required', { field: i18n.t(fieldKey) }));
}

// Helper to create optional string
export function optionalString() {
  return z.string().optional().or(z.literal(''));
}

// Helper to create email field
export function emailField(fieldKey = 'fields.email') {
  return requiredString(fieldKey).email(i18n.t('validation.string.email'));
}

// Helper to create phone field
export function phoneField(fieldKey = 'fields.phone') {
  return requiredString(fieldKey).regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    i18n.t('validation.custom.phoneInvalid')
  );
}

// Helper to create password field
export function passwordField(fieldKey = 'fields.password', minLength = 8) {
  return requiredString(fieldKey).min(
    minLength,
    i18n.t('validation.string.min', { field: i18n.t(fieldKey), min: minLength })
  );
}

// Helper to create strong password field
export function strongPasswordField(fieldKey = 'fields.password') {
  return requiredString(fieldKey)
    .min(8, i18n.t('validation.string.min', { field: i18n.t(fieldKey), min: 8 }))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      i18n.t('validation.custom.passwordWeak')
    );
}

// Helper to create confirm password field
export function confirmPasswordField(
  passwordFieldName: string,
  fieldKey = 'fields.confirmPassword'
) {
  return requiredString(fieldKey);
}

// Helper to add password match refinement to schema
export function withPasswordMatch<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  passwordField = 'password',
  confirmField = 'confirmPassword'
) {
  return schema.refine(
    (data) => data[passwordField] === data[confirmField],
    {
      message: i18n.t('validation.custom.passwordMismatch'),
      path: [confirmField],
    }
  );
}

// Helper to create date field
export function dateField(fieldKey = 'fields.date') {
  return z.date({
    required_error: i18n.t('validation.required', { field: i18n.t(fieldKey) }),
    invalid_type_error: i18n.t('validation.date.invalid'),
  });
}

// Helper to create number field
export function numberField(fieldKey: string) {
  return z.number({
    required_error: i18n.t('validation.required', { field: i18n.t(fieldKey) }),
    invalid_type_error: i18n.t('validation.requiredField'),
  });
}

// Helper to create positive number field
export function positiveNumberField(fieldKey: string) {
  return numberField(fieldKey).positive(
    i18n.t('validation.number.positive', { field: i18n.t(fieldKey) })
  );
}

// Helper to create select field (non-empty string)
export function selectField(fieldKey: string) {
  return z.string({
    required_error: i18n.t('validation.required', { field: i18n.t(fieldKey) }),
  }).min(1, i18n.t('validation.custom.invalidSelection'));
}

// Helper to create multi-select field (non-empty array)
export function multiSelectField(fieldKey: string, minItems = 1) {
  return z
    .array(z.string())
    .min(minItems, i18n.t('validation.array.min', { min: minItems }));
}
