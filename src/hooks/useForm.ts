import { useForm as useReactHookForm, type UseFormProps, type FieldValues, type UseFormReturn, type Path, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslation } from 'react-i18next';

interface UseFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodSchema<T>;
  onSubmit?: SubmitHandler<T>;
}

interface UseFormReturnExtended<T extends FieldValues> extends UseFormReturn<T> {
  /** Get field error message (already translated) */
  getError: (name: Path<T>) => string | undefined;
  /** Check if field has error */
  hasError: (name: Path<T>) => boolean;
  /** Handle form submission */
  handleSubmitForm: (e?: React.BaseSyntheticEvent) => Promise<void>;
  /** Check if form is submitting */
  isSubmitting: boolean;
}

/**
 * Enhanced useForm hook with zod validation and i18n support
 * 
 * @example
 * const schema = z.object({
 *   firstName: requiredString('fields.firstName'),
 *   email: emailField(),
 * });
 * 
 * const form = useForm({
 *   schema,
 *   defaultValues: { firstName: '', email: '' },
 *   onSubmit: (data) => console.log(data),
 * });
 * 
 * // In JSX:
 * <form onSubmit={form.handleSubmitForm}>
 *   <FormInput name="firstName" form={form} label={t('fields.firstName')} />
 *   <FormInput name="email" form={form} label={t('fields.email')} type="email" />
 * </form>
 */
export function useForm<T extends FieldValues>(
  options: UseFormOptions<T>
): UseFormReturnExtended<T> {
  const { schema, onSubmit, ...formOptions } = options;
  const { t } = useTranslation();

  const form = useReactHookForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    mode: 'onBlur',
    ...formOptions,
  });

  const getError = (name: Path<T>): string | undefined => {
    const error = form.formState.errors[name];
    if (!error?.message) return undefined;
    
    const message = error.message as string;
    // If the message is a translation key, translate it
    if (message.startsWith('validation.') || message.startsWith('errors.')) {
      return t(message);
    }
    return message;
  };

  const hasError = (name: Path<T>): boolean => {
    return !!form.formState.errors[name];
  };

  const handleSubmitForm = form.handleSubmit(async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  });

  return {
    ...form,
    getError,
    hasError,
    handleSubmitForm,
    isSubmitting: form.formState.isSubmitting,
  };
}
