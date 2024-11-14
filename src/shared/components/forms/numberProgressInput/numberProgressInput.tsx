import { useFormField } from '@/shared/hooks/useFormField';
import {
    AlertInline,
    Card,
    type IAlertInlineProps,
    type IInputNumberProps,
    InputContainer,
    InputNumber,
    invariant,
    Progress,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useId } from 'react';

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
     * Prefix for the input component.
     */
    prefix?: string;
    /**
     * Suffix for the input component.
     */
    suffix?: string;
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
}

export const NumberProgressInput: React.FC<INumberProgressInputProps> = (props) => {
    const {
        label,
        helpText,
        fieldName,
        valueLabel,
        total,
        totalLabel,
        alert: alertProp,
        className,
        prefix,
        suffix,
        thresholdIndicator,
        ...otherProps
    } = props;

    invariant(total > 0, 'NumberProgressInput: total property must be greater than 0');

    const containerId = useId();

    const {
        value = 0,
        label: fieldLabel,
        onChange,
        alert,
        ...numberField
    } = useFormField<Record<string, number | undefined>, typeof fieldName>(fieldName, {
        label,
        rules: { required: true },
    });

    const progressValue = (value * 100) / total;

    const valueLabelLeft = valueLabel ? Math.max(progressValue, valueLabel.length * 0.6) : 0;
    const valueLabelStyle = { left: `${valueLabelLeft}%`, transform: 'translateX(-50%)' };

    const processedAlert = alertProp ?? alert;

    return (
        <InputContainer
            id={containerId}
            label={label}
            helpText={helpText}
            useCustomWrapper={true}
            className={className}
        >
            <Card className="flex w-full flex-col gap-6 rounded-xl border border-neutral-100 p-4 md:p-6">
                <div className="flex flex-row items-center justify-between gap-6">
                    <InputNumber
                        value={value}
                        className="max-w-40"
                        min={1}
                        max={total}
                        onChange={(value) => onChange(Number(value))}
                        prefix={prefix}
                        suffix={suffix}
                        {...numberField}
                        {...otherProps}
                    />
                    <div className={classNames('relative flex grow flex-col gap-2', { 'self-end': totalLabel })}>
                        {valueLabel && (
                            <p
                                className="absolute -top-6 whitespace-nowrap text-primary-400 transition-all duration-500 ease-in-out"
                                style={valueLabelStyle}
                            >
                                {valueLabel}
                            </p>
                        )}
                        <Progress thresholdIndicator={thresholdIndicator} value={progressValue} />
                        {totalLabel && (
                            <p className="self-end text-xs font-normal leading-tight text-neutral-500">{totalLabel}</p>
                        )}
                    </div>
                </div>
                {processedAlert && <AlertInline variant={processedAlert.variant} message={processedAlert.message} />}
            </Card>
        </InputContainer>
    );
};
