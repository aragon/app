import { useTranslations } from '@/shared/components/translationsProvider';
import {
    useController,
    type FieldPath,
    type FieldValue,
    type FieldValues,
    type Path,
    type RegisterOptions,
} from 'react-hook-form';
import type { IUseFormFieldOptions, IUseFormFieldReturn } from './useFormField.api';

export const useFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    name: TName,
    options?: IUseFormFieldOptions,
): IUseFormFieldReturn => {
    const { t } = useTranslations();

    const { label, rules, ...otherOptions } = options ?? {};

    const baseRules: RegisterOptions<TFieldValues, TName> = {
        ...rules,
        validate: {
            ...(rules?.validate as Record<string, (value: FieldValue<TFieldValues>) => string | boolean>),
            noEmptyStrings: (value: FieldValue<TFieldValues>) => {
                if (typeof value === 'string' && value !== '') {
                    return !!value.trim();
                }
                return true;
            },
        },
        deps: rules?.deps as Path<TFieldValues> | Array<Path<TFieldValues>> | undefined,
    };

    const { field, fieldState } = useController({
        name,
        ...otherOptions,
        rules: baseRules,
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
