import { useTranslations } from '@/shared/components/translationsProvider';
import type { IInputContainerProps } from '@aragon/ods';
import {
    useController,
    type FieldPath,
    type FieldPathValue,
    type FieldValues,
    type UseControllerProps,
    type UseControllerReturn,
} from 'react-hook-form';

export interface IUseFormFieldOptions<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    /**
     * Disables the field when set to true.
     */
    disabled?: boolean;
    /**
     * Validation rules for the field.
     */
    rules?: UseControllerProps['rules'];
    /**
     * Label of the field to be displayed on validation errors. Defaults to field name.
     */
    label?: string;
    /**
     * Default value of the field.
     */
    defaultValue?: FieldPathValue<TFieldValues, TName>;
}

export type IUseFormFieldReturn = UseControllerReturn['field'] & {
    /**
     * Variant of the input field.
     */
    variant: IInputContainerProps['variant'];
    /**
     * Alert to be displayed.
     */
    alert?: IInputContainerProps['alert'];
    /**
     * Label of the field, only set when passed as option.
     */
    label?: IInputContainerProps['label'];
};

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
