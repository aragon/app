import { useTranslations } from '@/shared/components/translationsProvider';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';
import type { IUseFormFieldOptions, IUseFormFieldReturn } from './useFormField.api';

export const useFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    name: TName,
    options?: IUseFormFieldOptions,
): IUseFormFieldReturn => {
    const { t } = useTranslations();

    const { label, ...otherOptions } = options ?? {};
    const { field, fieldState } = useController({ name, ...otherOptions });

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
