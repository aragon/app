import type { IAlertInlineProps, IInputNumberProps, ITagProps } from '@aragon/gov-ui-kit';

export interface INumberProgressInputProps extends Omit<IInputNumberProps, 'value' | 'alert'> {
    /**
     * Name of the form field.
     */
    fieldName: string;
    /**
     * Label displayed above the progress component.
     */
    valueLabel?: string;
    /**
     * Default value for the form field.
     */
    defaultValue?: number;
    /**
     * Value used for normalising the value and display it on the progress.
     */
    total: number;
    /**
     * Label displayed below the progress component.
     */
    totalLabel?: string;
    /**
     * Alert displayed below the input component.
     */
    alert?: Pick<IAlertInlineProps, 'message' | 'variant'>;
    /**
     * Threshold indicator for the progress component
     */
    thresholdIndicator?: number;
    /**
     * Optional tags to be displayed to the left and right of the progress component. The first tag will be displayed to the left and the second to the right.
     */
    tags?: [ITagProps, ITagProps];

    /**
     * Maximum allowed value for the input.
     */
    max?: number;

    /**
     * Minimum allowed value for the input.
     */
    min?: number;

    /**
     * Custom validation function for the input value.
     */
    validate?: (value: number | undefined) => boolean | string;
}
