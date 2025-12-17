import { AlertInline, Card, InputContainer, InputNumber, invariant, Progress, Tag } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useId } from 'react';
import { useFormField } from '@/shared/hooks/useFormField';
import type { INumberProgressInputProps } from './numberProgressInput.api';

export const NumberProgressInput: React.FC<INumberProgressInputProps> = (props) => {
    const {
        label,
        helpText,
        fieldName,
        defaultValue,
        valueLabel,
        total,
        totalLabel,
        alert: alertProp,
        className,
        prefix,
        suffix,
        thresholdIndicator,
        tags,
        ...otherProps
    } = props;

    invariant(total > 0, 'NumberProgressInput: total property must be greater than 0');

    const containerId = useId();

    const {
        value = 0,
        onChange,
        alert,
        ...numberField
    } = useFormField<Record<string, number | undefined>, typeof fieldName>(fieldName, {
        label,
        rules: { required: true, max: total },
        defaultValue,
    });

    const progressValue = (value * 100) / total;

    const valueLabelLength = valueLabel?.length ?? 0;
    const valueLabelLeft = Math.min(100 - valueLabelLength, Math.max(progressValue, valueLabelLength));
    const valueLabelStyle = {
        left: `${valueLabelLeft.toString()}%`,
        transform: 'translateX(-50%)',
    };

    const processedAlert = alertProp ?? alert;

    return (
        <InputContainer className={className} helpText={helpText} id={containerId} label={label} useCustomWrapper={true}>
            <Card className="flex w-full flex-col gap-4 rounded-xl border border-neutral-100 p-4 md:gap-6 md:p-6">
                <div className="flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
                    <InputNumber
                        className="w-full md:max-w-40"
                        max={total}
                        onChange={(value) => onChange(Number(value))}
                        prefix={prefix}
                        suffix={suffix}
                        value={value}
                        {...numberField}
                        {...otherProps}
                    />
                    <div
                        className={classNames('mt-4 flex w-full grow flex-col gap-2 md:mt-0', {
                            'self-end': totalLabel,
                        })}
                    >
                        <div className="flex items-center gap-3">
                            {tags && <Tag {...tags[0]} />}
                            <div className="relative flex grow">
                                {valueLabel && (
                                    <p
                                        className="absolute -top-5 whitespace-nowrap text-primary-400 text-xs transition-all duration-500 ease-in-out"
                                        style={valueLabelStyle}
                                    >
                                        {valueLabel}
                                    </p>
                                )}
                                <Progress thresholdIndicator={thresholdIndicator} value={progressValue} />
                            </div>
                            {tags && <Tag {...tags[1]} />}
                        </div>

                        {totalLabel && <p className="self-end font-normal text-neutral-500 text-xs leading-tight">{totalLabel}</p>}
                    </div>
                </div>
                {processedAlert && (
                    <AlertInline className="self-center md:self-auto" message={processedAlert.message} variant={processedAlert.variant} />
                )}
            </Card>
        </InputContainer>
    );
};
