import { useTranslations } from '@/shared/components/translationsProvider';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';
import type { IUseFormFieldOptions, IUseFormFieldReturn } from './useFormField.api';

export const useFormField = <TFieldValues extends FieldValues = never, TName extends FieldPath<TFieldValues> = never>(
    name: TName,
    options?: IUseFormFieldOptions<TFieldValues, TName>,
): IUseFormFieldReturn<TFieldValues, TName> => {
    const { t } = useTranslations();

    const { label, fieldPrefix, rules, ...otherOptions } = options ?? {};

    const processedFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const { field, fieldState } = useController<TFieldValues, TName>({
        name: processedFieldName as TName,
        rules: rules,
        ...otherOptions,
    });

    const { error } = fieldState;

    const inputVariant = error != null ? 'critical' : 'default';

    const alertMessageKey = `app.shared.formField.error.${error?.type}`;
    const alertValue = error?.type === 'min' ? rules?.min?.toString() : rules?.max?.toString();
    const alertMessageParams = { name: label ?? name, value: alertValue };

    const alert =
        error?.type != null
            ? { message: t(alertMessageKey, alertMessageParams), variant: 'critical' as const }
            : undefined;

    return { ...field, variant: inputVariant, alert, label: options?.label };
};
