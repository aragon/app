import { useMemo } from 'react';
import {
    type FieldPath,
    type FieldValues,
    type Noop,
    useController,
} from 'react-hook-form';
import { match } from 'ts-pattern';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    sanitizePlainText,
    sanitizePlainTextMultiline,
} from '@/shared/security';
import type {
    IUseFormFieldOptions,
    IUseFormFieldReturn,
} from './useFormField.api';

export const useFormField = <
    TFieldValues extends FieldValues = never,
    TName extends FieldPath<TFieldValues> = never,
>(
    name: TName,
    options?: IUseFormFieldOptions<TFieldValues, TName>,
): IUseFormFieldReturn<TFieldValues, TName> => {
    const { t } = useTranslations();

    const {
        label,
        fieldPrefix,
        rules,
        trimOnBlur,
        alertValue: alertValueProp,
        sanitizeMode = 'singleline',
        sanitizeOnBlur = false,
        ...otherOptions
    } = options ?? {};

    const processedFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const { field, fieldState } = useController<TFieldValues, TName>({
        name: processedFieldName as TName,
        rules,
        ...otherOptions,
    });

    const handleBlur = (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        if (!sanitizeOnBlur) {
            field.onBlur();
            return;
        }

        const rawValue = event.target.value;
        const baseValue = trimOnBlur ? rawValue.trim() : rawValue;
        const processedValue =
            sanitizeMode === 'none'
                ? baseValue
                : sanitizeMode === 'multiline'
                  ? sanitizePlainTextMultiline(baseValue)
                  : sanitizePlainText(baseValue);
        field.onChange(processedValue);
        field.onBlur();
    };

    const { error } = fieldState;

    const inputVariant = error != null ? 'critical' : 'default';

    const alert = useMemo(() => {
        if (error?.type == null && error?.message == null) {
            return undefined;
        }

        const alertMessageKey = `app.shared.formField.error.${error.type}`;
        const alertValue = match(error.type)
            .with('min', () => rules?.min)
            .with('max', () => rules?.max)
            .with('minLength', () => rules?.minLength)
            .with('maxLength', () => rules?.maxLength)
            .otherwise(() => undefined);
        const alertMessageParams = {
            name: label ?? name,
            value: alertValue?.toString(),
        };

        const alertMessage =
            error.message != null && error.message.length > 0
                ? t(error.message, alertValueProp)
                : t(alertMessageKey, alertMessageParams);

        return { message: alertMessage, variant: 'critical' as const };
    }, [error, rules, label, alertValueProp, t, name]);

    return {
        ...field,
        onBlur: handleBlur as Noop,
        variant: inputVariant,
        alert,
        label: options?.label,
    };
};
