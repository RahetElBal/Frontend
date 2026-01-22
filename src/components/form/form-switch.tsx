import { type FieldValues, type Path, type UseFormReturn, Controller } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormSwitchProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T> & { getError?: (name: Path<T>) => string | undefined };
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Form switch field with react-hook-form integration
 * 
 * @example
 * <FormSwitch name="isActive" form={form} label={t('fields.isActive')} />
 */
export function FormSwitch<T extends FieldValues>({
  name,
  form,
  label,
  description,
  disabled,
  className,
}: FormSwitchProps<T>) {
  const error = form.getError?.(name) || form.formState.errors[name]?.message as string | undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label
            htmlFor={name}
            className={cn(error && 'text-destructive')}
          >
            {label}
          </Label>
          {description && !error && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Controller
          name={name}
          control={form.control}
          render={({ field }) => (
            <Switch
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!error}
            />
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
