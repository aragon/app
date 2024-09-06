import { useTranslations } from '@/shared/components/translationsProvider';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';
import type { IUseFormFieldOptions, IUseFormFieldReturn } from './useFormField.api';

export const useFormField = <TFieldValues extends FieldValues = never, TName extends FieldPath<TFieldValues> = never>(
    name: TName,
    options?: IUseFormFieldOptions<TFieldValues, TName>,
): IUseFormFieldReturn<TFieldValues, TName> => {
    const { t } = useTranslations();

    const { label, fieldPrefix, ...otherOptions } = options ?? {};

    const processedFieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const { field, fieldState } = useController<TFieldValues, TName>({
        name: processedFieldName as TName,
        ...otherOptions,
    });

    const variant = fieldState.error != null ? 'critical' : 'default';

    const alert =
        fieldState.error != null
            ? {
                  message: t(`app.shared.formField.error.${fieldState.error.type}`, { name: label ?? name }),
                  variant: 'critical' as const,
              }
            : undefined;

    return { ...field, variant, alert, label: options?.label };
};
