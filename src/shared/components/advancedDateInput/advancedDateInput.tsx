import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputDate, InputNumber, InputText, InputTime, RadioCard, RadioGroup } from '@aragon/ods';
import { useCallback, useState } from 'react';
import { useDefaultValues } from './utils/defaultValues';
import { DateTime, Duration } from 'luxon';
import { useForm, useWatch } from 'react-hook-form';

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
    const { setValue, trigger } = useForm();
    const [inputMode, setInputMode] = useState<string>(useDuration ? 'duration' : 'now');
    const isNow = inputMode === 'now';

    const defaultValues = useDefaultValues({
        minDuration,
        startTime:
            startTime ??
            (isNow ? { date: DateTime.now().toISODate(), time: DateTime.now().toFormat('HH:mm') } : undefined),
        isNow,
    });

    const getMinDate = () => {
        return DateTime.now().plus({ seconds: minDuration }).startOf('day');
    };

    const dateField = useFormField(`${label}Date`, {
        label: 'Date',
        rules: {
            required: inputMode === 'fixed',
            validate: (date: string) => {
                if (inputMode !== 'fixed') return true;
                if (!isStartField) return true;
                const selectedDate = DateTime.fromISO(date);
                const minDate = getMinDate();
                return selectedDate >= minDate;
            },
        },
        defaultValue: defaultValues.dateTime.date,
    });

    const timeField = useFormField(`${label}Time`, {
        label: 'Time',
        rules: {
            required: inputMode === 'fixed',
            validate: (time: string) => {
                if (inputMode !== 'fixed') return true;
                const [hours, minutes] = time.split(':').map(Number);
                const selectedDateTime = DateTime.fromISO(dateField.value).set({ hour: hours, minute: minutes });
                const minDateTime = DateTime.now().plus({ seconds: minDuration });
                return selectedDateTime >= minDateTime;
            },
        },
        defaultValue: defaultValues.dateTime.time,
    });

    const watchedDuration = useWatch({
        name: `${label}Duration`,
        defaultValue: defaultValues.duration,
    });

    const validateDuration = useCallback(
        (value: { days: number; hours: number; minutes: number }) => {
            if (inputMode !== 'duration') return true;
            console.debug('Validate duration', value);
            const safeValue = {
                days: Number(value.days) || 0,
                hours: Number(value.hours) || 0,
                minutes: Number(value.minutes) || 0,
            };

            const duration = Duration.fromObject(safeValue);
            const minDurationDuration = Duration.fromObject({ seconds: minDuration });

            if (duration < minDurationDuration) {
                return false;
            }

            return true;
        },
        [inputMode, minDuration],
    );

    // const durationField = useFormField(`${label}Duration`, {
    //     rules: {
    //         validate: validateDuration,
    //     },
    //     defaultValue: defaultValues.duration,
    // });

    // const handleDurationChange =
    //     (field: 'days' | 'hours' | 'minutes') => (event: React.ChangeEvent<HTMLInputElement>) => {
    //         console.debug('Duration change', field, event.target.value);
    //         const value = parseInt(event.target.value, 10) || 0;
    //         setValue(`${label}Duration`, { ...durationField.value, [field]: value }, { shouldValidate: true });
    //         trigger(`${label}Duration`);
    //     };

    const durationMinutesField = useFormField(`${label}Duration.minutes`, {
        label: 'Minutes',
        rules: {
            required: inputMode === 'duration',
            min: 0,
            max: 59,
            //onChange: handleDurationChange('minutes'),
            validate: (value) => validateDuration({ ...watchedDuration, minutes: value }),
        },
        defaultValue: defaultValues.duration.minutes,
    });

    const durationHoursField = useFormField(`${label}Duration.hours`, {
        label: 'Hours',
        rules: {
            required: inputMode === 'duration',
            min: 0,
            max: 23,
            //onChange: handleDurationChange('hours'),
            validate: (value) => validateDuration({ ...watchedDuration, hours: value }),
        },
        defaultValue: defaultValues.duration.hours,
    });

    const durationDaysField = useFormField(`${label}Duration.days`, {
        label: 'Days',
        rules: {
            required: inputMode === 'duration',
            min: 0,
            //onChange: handleDurationChange('days'),
            validate: (value) => validateDuration({ ...watchedDuration, days: value }),
        },
        defaultValue: defaultValues.duration.days,
    });

    const fixedErrors = dateField.alert ?? timeField.alert;
    const durationErrors = durationDaysField.alert ?? durationHoursField.alert ?? durationMinutesField.alert;

    return (
        <>
            <RadioGroup
                label={label}
                className="flex gap-4 md:!flex-row"
                helpText={helpText}
                value={inputMode}
                onValueChange={setInputMode}
            >
                <RadioCard
                    className="w-full"
                    label={useDuration ? 'Duration' : 'Now'}
                    description=""
                    value={useDuration ? 'duration' : 'now'}
                />
                <RadioCard className="w-full" label="Specific date & time" description="" value="fixed" />
            </RadioGroup>
            {inputMode === 'fixed' && (
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
            {inputMode === 'duration' && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <InputNumber
                            min={0}
                            max={59}
                            className="w-full md:w-1/3"
                            placeholder="0 min"
                            {...durationMinutesField}
                        />
                        <InputNumber
                            min={0}
                            max={23}
                            className="w-full md:w-1/3"
                            placeholder="0 h"
                            {...durationHoursField}
                        />
                        <InputNumber min={0} className="w-full md:w-1/3" placeholder="7 d" {...durationDaysField} />
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
