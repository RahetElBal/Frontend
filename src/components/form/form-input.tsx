import { type FieldValues, type Path, type UseFormReturn, Controller } from 'react-hook-form';
import { Input, type InputProps } from '@/components/ui/input';
import { FormField } from './form-field';
import { cn } from '@/lib/utils';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name' | 'form'> {
  name: Path<T>;
  form: UseFormReturn<T> & { getError?: (name: Path<T>) => string | undefined };
  label?: string;
  description?: string;
}

/**
 * Form input field with react-hook-form integration
 * 
 * @example
 * <FormInput name="firstName" form={form} label={t('fields.firstName')} />
 * <FormInput name="email" form={form} label={t('fields.email')} type="email" />
 */
export function FormInput<T extends FieldValues>({
  name,
  form,
  label,
  description,
  className,
  ...props
}: FormInputProps<T>) {
  const error = form.getError?.(name) || form.formState.errors[name]?.message as string | undefined;

  return (
    <FormField
      label={label}
      error={error}
      required={props.required}
      description={description}
    >
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => (
          <Input
            {...field}
            {...props}
            className={cn(error && 'border-destructive', className)}
            aria-invalid={!!error}
          />
        )}
      />
    </FormField>
  );
}
