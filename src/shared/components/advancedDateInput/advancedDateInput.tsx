import { RadioCard, RadioGroup } from '@aragon/ods';

export interface IAdvancedDateInputProps {
    /**
     * Boolean to enable or disable duration on end time.
     */
    useDuration: boolean;
    /**
     * Label for the input.
     */
    label: string;
    /**
     * Help text for the input.
     */
    helpText: string;
    /**
     * Value of the input.
     */
    value: string;
    /**
     * Callback when the value changes.
     */
    onChange: (value: string) => void;
}

export const AdvancedDateInput: React.FC<IAdvancedDateInputProps> = ({
    useDuration,
    label,
    helpText,
    value,
    onChange,
}) => {
    return (
        <RadioGroup
            label={label}
            className="flex !flex-row gap-4"
            helpText={helpText}
            value={value}
            onValueChange={onChange}
        >
            <RadioCard
                className="w-full"
                label={useDuration ? 'Duration' : 'Now'}
                description=""
                value={useDuration ? 'duration' : 'now'}
            />
            <RadioCard className="w-full" label="Specific date & time" description="" value="fixed" />
        </RadioGroup>
    );
};
