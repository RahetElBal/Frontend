import { type FieldValues, type Path, type UseFormReturn, Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormCheckboxProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T> & { getError?: (name: Path<T>) => string | undefined };
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Form checkbox field with react-hook-form integration
 * 
 * @example
 * <FormCheckbox name="isActive" form={form} label={t('fields.isActive')} />
 */
export function FormCheckbox<T extends FieldValues>({
  name,
  form,
  label,
  description,
  disabled,
  className,
}: FormCheckboxProps<T>) {
  const error = form.getError?.(name) || form.formState.errors[name]?.message as string | undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Controller
          name={name}
          control={form.control}
          render={({ field }) => (
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!error}
            />
          )}
        />
        <Label
          htmlFor={name}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive'
          )}
        >
          {label}
        </Label>
      </div>
      {description && !error && (
        <p className="text-sm text-muted-foreground ps-6">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive ps-6">{error}</p>
      )}
    </div>
  );
}
