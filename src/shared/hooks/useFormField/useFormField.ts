import { useTranslations } from '@/shared/components/translationsProvider';
import { useMemo } from 'react';
import { type FieldPath, type FieldValues, type Noop, useController } from 'react-hook-form';
import type { IUseFormFieldOptions, IUseFormFieldReturn } from './useFormField.api';

export const useFormField = <TFieldValues extends FieldValues = never, TName extends FieldPath<TFieldValues> = never>(
    name: TName,
    options?: IUseFormFieldOptions<TFieldValues, TName>,
): IUseFormFieldReturn<TFieldValues, TName> => {
    const { t } = useTranslations();

    const { label, fieldPrefix, rules, trimOnBlur, ...otherOptions } = options ?? {};

    const processedFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const { field, fieldState } = useController<TFieldValues, TName>({
        name: processedFieldName as TName,
        rules: rules,
        ...otherOptions,
    });

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (trimOnBlur) {
            const trimmedValue = event.target.value.trim();
            field.onChange(trimmedValue);
        }
        field.onBlur();
    };

    const { error } = fieldState;

    const inputVariant = error != null ? 'critical' : 'default';

    const alert = useMemo(() => {
        if (error?.type == null) {
            return undefined;
        }

        const alertMessageKey = `app.shared.formField.error.${error.type}`;
        const alertValue = error.type === 'min' ? rules?.min?.toString() : rules?.max?.toString();
        const alertMessageParams = { name: label ?? name, value: alertValue };

        const alertMessage =
            error.message != null && error.message.length > 0
                ? t(error.message)
                : t(alertMessageKey, alertMessageParams);

        return { message: alertMessage, variant: 'critical' as const };
    }, [error, rules, label, t, name]);

    return {
        ...field,
        onBlur: handleBlur as Noop,
        variant: inputVariant,
        alert,
        label: options?.label,
    };
};
