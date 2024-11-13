import { useFormField } from '@/shared/hooks/useFormField';
import { Card, type IInputNumberProps, InputContainer, InputNumber, invariant, Progress } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useId } from 'react';

export interface INumberProgressInputProps extends Omit<IInputNumberProps, 'value'> {
    /**
     * Name of the form field.
     */
    fieldName: string;
    /**
     * Label displayed above the progress component.
     */
    valueLabel: string;
    /**
     * Value used for normalising the value and display it on the progress.
     */
    total: number;
    /**
     * Label displayed below the progress component.
     */
    totalLabel: string;
}

export const NumberProgressInput: React.FC<INumberProgressInputProps> = (props) => {
    const { label, helpText, fieldName, valueLabel, total, totalLabel, className, ...otherProps } = props;

    invariant(total > 0, 'NumberProgressInput: total property must be greater than 0');

    const { value, ...numberField } = useFormField<Record<string, number>, typeof fieldName>(fieldName, {
        rules: { min: 1 },
    });

    const containerId = useId();

    const progressValue = (value * 100) / total;
    const labelLeft = Math.max(progressValue, valueLabel.length * 0.6);

    return (
        <InputContainer id={containerId} label={label} helpText={helpText} useCustomWrapper={true}>
            <Card
                className={classNames(
                    'flex w-full flex-row justify-between gap-6 rounded-xl border border-neutral-100 p-4 md:p-6',
                    className,
                )}
            >
                <InputNumber value={value} className="max-w-40" min={1} {...numberField} {...otherProps} />
                <div className="relative flex grow flex-col gap-2 self-end">
                    <p
                        className="absolute -top-6 text-primary-400 transition-all duration-500 ease-in-out"
                        style={{ left: `${labelLeft}%`, transform: 'translateX(-50%)' }}
                    >
                        {valueLabel}
                    </p>
                    <Progress value={progressValue} />
                    <p className="self-end text-xs font-normal leading-tight text-neutral-500">{totalLabel}</p>
                </div>
            </Card>
        </InputContainer>
    );
};
