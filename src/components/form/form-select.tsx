import { type FieldValues, type Path, type UseFormReturn, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from './form-field';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T> & { getError?: (name: Path<T>) => string | undefined };
  label?: string;
  description?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Form select field with react-hook-form integration
 * 
 * @example
 * <FormSelect 
 *   name="category" 
 *   form={form} 
 *   label={t('fields.category')}
 *   options={[
 *     { value: 'manucure', label: 'Manucure' },
 *     { value: 'soins', label: 'Soins' },
 *   ]}
 * />
 */
export function FormSelect<T extends FieldValues>({
  name,
  form,
  label,
  description,
  placeholder,
  options,
  required,
  disabled,
  className,
}: FormSelectProps<T>) {
  const error = form.getError?.(name) || form.formState.errors[name]?.message as string | undefined;

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      description={description}
    >
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(error && 'border-destructive', className)}
              aria-invalid={!!error}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}
