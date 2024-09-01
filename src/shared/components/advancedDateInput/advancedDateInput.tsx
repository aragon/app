import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputDate, InputNumber, InputText, InputTime, RadioCard, RadioGroup } from '@aragon/ods';
import { useState } from 'react';
import { useDefaultValues } from './utils/defaultValues';

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
     * Min date for the input.
     */
    minDuration?: number;
    /**
     * Start time to be used for validation.
     */
    startTime?: { date: string; time: string };
    /**
     *   Boolean to indicate if start time
     */
    isStartField: boolean;
}

export const AdvancedDateInput: React.FC<IAdvancedDateInputProps> = ({
    useDuration,
    label,
    helpText,
    minDuration = 0,
    startTime,
    isStartField,
}) => {
    //const [value, setValue] = useState<'now' | 'duration' |'fixed'>(useDuration ? 'duration' : 'now');
    const [value, setValue] = useState<string>(useDuration ? 'duration' : 'now');

    const defaultValues = useDefaultValues({ minDuration, startTime });

    const getMinDate = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return new Date(now.getTime() + minDuration * 1000);
    };

    const dateField = useFormField(`${label}Date`, {
        label: 'Date',
        rules: {
            required: value === 'fixed',
            validate: (date: string) => {
                if (value !== 'fixed') return true;
                if (!isStartField) return true;
                const selectedDate = new Date(date);
                const minDate = getMinDate();
                return selectedDate >= minDate;
            },
        },
        defaultValue: defaultValues.dateTime.date,
    });

    const timeField = useFormField(`${label}Time`, {
        label: 'Time',
        rules: {
            required: value === 'fixed',
            validate: (time: string) => {
                if (value !== 'fixed') return true;
                const [hours, minutes] = time.split(':').map(Number);
                const selectedDateTime = new Date(dateField.value);
                selectedDateTime.setHours(hours, minutes);
                const now = new Date();
                const minDateTime = new Date(now.getTime() + minDuration * 1000);
                return selectedDateTime >= minDateTime;
            },
        },
        defaultValue: defaultValues.dateTime.time,
    });

    const durationMinutesField = useFormField(`${label}Minutes`, {
        label: 'Minutes',
        rules: {
            required: value === 'duration',
            min: 0,
            max: 59,
        },
        defaultValue: defaultValues.duration.minutes,
    });

    const durationHoursField = useFormField(`${label}Hours`, {
        label: 'Hours',
        rules: { required: value === 'duration', min: 0, max: 23 },
        defaultValue: defaultValues.duration.hours,
    });

    const durationDaysField = useFormField(`${label}Days`, {
        label: 'Days',
        rules: { required: value === 'duration', min: 0 },
        defaultValue: defaultValues.duration.days,
    });

    const durationErrors = durationDaysField.alert ?? durationHoursField.alert ?? durationMinutesField.alert;
    const fixedErrors = dateField.alert ?? timeField.alert;

    return (
        <>
            <RadioGroup
                label={label}
                className="flex gap-4 md:!flex-row"
                helpText={helpText}
                value={value}
                onValueChange={setValue}
            >
                <RadioCard
                    className="w-full"
                    label={useDuration ? 'Duration' : 'Now'}
                    description=""
                    value={useDuration ? 'duration' : 'now'}
                />
                <RadioCard className="w-full" label="Specific date & time" description="" value="fixed" />
            </RadioGroup>
            {value === 'fixed' && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <InputDate
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full md:w-1/3"
                            {...dateField}
                        />
                        <InputTime className="w-full md:w-1/3" {...timeField} />
                        <InputText className="w-full md:w-1/3" label="Timezone" placeholder="UTC +2" disabled={true} />
                    </div>
                    {!isStartField && (
                        <AlertCard
                            message={label}
                            description={
                                fixedErrors
                                    ? 'One hour is the minimum expiration time'
                                    : "It's recommended to have an expiration time of five days, so you have a clean proposal list."
                            }
                            variant={fixedErrors ? 'critical' : 'info'}
                        />
                    )}
                </Card>
            )}
            {value === 'duration' && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <InputNumber className="w-full md:w-1/3" placeholder="0 min" {...durationMinutesField} />
                        <InputNumber className="w-full md:w-1/3" placeholder="0 h" {...durationHoursField} />
                        <InputNumber className="w-full md:w-1/3" placeholder="7 d" {...durationDaysField} />
                    </div>
                    <AlertCard
                        message="Expiration time"
                        description={
                            durationErrors
                                ? 'One hour is the minimum expiration time'
                                : "It's recommended to have an expiration time of five days, so you have a clean proposal list."
                        }
                        variant={durationErrors ? 'critical' : 'info'}
                    />
                </Card>
            )}
        </>
    );
};
