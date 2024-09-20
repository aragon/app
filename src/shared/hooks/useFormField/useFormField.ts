// useFormField.ts
import { useTranslations } from '@/shared/components/translationsProvider';
import { FieldPath, FieldValues, Noop, useController } from 'react-hook-form';
import type { IUseFormFieldOptions, IUseFormFieldReturn } from './useFormField.api';

interface IUseFormFieldOptionsExtended<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
    extends IUseFormFieldOptions<TFieldValues, TName> {
    trimOnBlur?: boolean; // Flag to control trimming behavior
}

export const useFormField = <TFieldValues extends FieldValues = never, TName extends FieldPath<TFieldValues> = never>(
    name: TName,
    options?: IUseFormFieldOptionsExtended<TFieldValues, TName>,
): IUseFormFieldReturn<TFieldValues, TName> => {
    const { t } = useTranslations();

    const { label, fieldPrefix, trimOnBlur, ...otherOptions } = options ?? {};
    const processedFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const { field, fieldState } = useController<TFieldValues, TName>({
        name: processedFieldName as TName,
        ...otherOptions,
    });

    const handleTrimOnBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>) => {
        if ('value' in event.target) {
            const trimmedValue = event.target.value.trim();
            field.onChange(trimmedValue);
        }
        field.onBlur();
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>) => {
        if (trimOnBlur) {
            handleTrimOnBlur(event);
        } else {
            field.onBlur();
        }
    };

    const variant = fieldState.error != null ? 'critical' : 'default';

    const alert =
        fieldState.error != null
            ? {
                  message: t(`app.shared.formField.error.${fieldState.error.type}`, { name: label ?? name }),
                  variant: 'critical' as const,
              }
            : undefined;

    return {
        ...field,
        onBlur: handleBlur as Noop,
        variant,
        alert,
        label: options?.label,
    };
};
