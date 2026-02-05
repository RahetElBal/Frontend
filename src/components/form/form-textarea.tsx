import { type FieldValues, type Path, type UseFormReturn, Controller } from 'react-hook-form';
import { Textarea, type TextareaProps } from '@/components/ui/textarea';
import { FormField } from './form-field';
import { cn } from '@/lib/utils';

interface FormTextareaProps<T extends FieldValues> extends Omit<TextareaProps, 'name' | 'form'> {
  name: Path<T>;
  form: UseFormReturn<T> & { getError?: (name: Path<T>) => string | undefined };
  label?: string;
  description?: string;
}

/**
 * Form textarea field with react-hook-form integration
 * 
 * @example
 * <FormTextarea name="notes" form={form} label={t('fields.notes')} rows={4} />
 */
export function FormTextarea<T extends FieldValues>({
  name,
  form,
  label,
  description,
  className,
  ...props
}: FormTextareaProps<T>) {
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
          <Textarea
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
