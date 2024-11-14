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
     * Value used for normalising the value and display it on the progress.
     */
    total: number;
    /**
     * Label displayed below the progress component.
     */
    totalLabel: string;
    /**
     * Alert displayed below the input component.
     */
    alert?: Pick<IAlertInlineProps, 'message' | 'variant'>;
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
            <Card className="flex w-full flex-col gap-4 rounded-xl border border-neutral-100 p-4 md:gap-6 md:p-6">
                <div className="flex flex-col-reverse justify-between gap-6 md:flex-row">
                    <InputNumber
                        value={value}
                        className="md:max-w-40"
                        min={1}
                        max={total}
                        onChange={(value) => onChange(Number(value))}
                        {...numberField}
                        {...otherProps}
                    />
                    <div className="relative mt-4 flex grow flex-col gap-2 md:mt-0 md:self-end">
                        {valueLabel && (
                            <p
                                className="absolute -top-6 text-primary-400 transition-all duration-500 ease-in-out"
                                style={valueLabelStyle}
                            >
                                {valueLabel}
                            </p>
                        )}
                        <Progress value={progressValue} />
                        <p className="self-end text-xs font-normal leading-tight text-neutral-500">{totalLabel}</p>
                    </div>
                </div>
                {processedAlert && (
                    <AlertInline
                        variant={processedAlert.variant}
                        message={processedAlert.message}
                        className="self-center md:self-auto"
                    />
                )}
            </Card>
        </InputContainer>
    );
};
