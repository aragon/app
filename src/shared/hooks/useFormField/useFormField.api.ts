import type { IInputContainerProps } from '@aragon/gov-ui-kit';
import {
    type FieldPath,
    type FieldPathValue,
    type FieldValues,
    type UseControllerProps,
    type UseControllerReturn,
} from 'react-hook-form';

export interface IUseFormFieldOptions<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
    /**
     * Disables the field when set to true.
     */
    disabled?: boolean;
    /**
     * Validation rules for the field.
     */
    rules?: UseControllerProps<TFieldValues, TName>['rules'];
    /**
     * Label of the field to be displayed on validation errors. Defaults to field name.
     */
    label?: string;
    /**
     * Default value of the field.
     */
    defaultValue?: FieldPathValue<TFieldValues, TName>;
    /*
     * Prefix to prepend to the field name.
     */
    fieldPrefix?: string;
    /**
     * Flag to control trimming behavior.
     */
    trimOnBlur?: boolean;
    /**
     * Control property to be used only when hook is not used inside a form-context provider.
     */
    control?: UseControllerProps<TFieldValues, TName>['control'];
}

export type IUseFormFieldReturn<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = UseControllerReturn<TFieldValues, TName>['field'] & {
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
