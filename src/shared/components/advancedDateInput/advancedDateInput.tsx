import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputDate, InputNumber, InputText, InputTime, RadioCard, RadioGroup } from '@aragon/ods';
import { useCallback, useEffect } from 'react';
import { useDefaultValues } from './utils/defaultValues';
import { DateTime, Duration } from 'luxon';
import { useFormContext, useWatch } from 'react-hook-form';

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
     * Field for the input to help parsing data.
     */
    field: string;
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
    startTime?: ICreateProposalFormFixedDateTime;
    /**
     *   Boolean to indicate if start time
     */
    isStartField: boolean;
}

interface ICreateProposalFormFixedDateTime {
    /**
     * Date in YYYY-MM-DD format.
     */
    date: string;
    /**
     * Time in HH:MM format.
     */
    time: string;
}

interface ICreateProposalFormDuration {
    /**
     * Minutes as a number between [0, 59] range.
     */
    minutes: number;
    /**
     * Hours as a number between [0, 23] range.
     */
    hours: number;
    /**
     * Number of days.
     */
    days: number;
}

export const AdvancedDateInput: React.FC<IAdvancedDateInputProps> = ({
    useDuration,
    label,
    helpText,
    minDuration = 0,
    startTime,
    isStartField,
    field,
}) => {
    const { clearErrors, setValue, trigger } = useFormContext();
    const modeField = useFormField(`${field}Mode`, { defaultValue: useDuration ? 'duration' : 'now' });
    const inputMode = useWatch({ name: `${field}Mode` });
    const isNow = inputMode === 'now' || isStartField;

    const defaultValues = useDefaultValues({
        minDuration,
        startTime:
            startTime ??
            (isNow ? { date: DateTime.now().toISODate(), time: DateTime.now().toFormat('HH:mm') } : undefined),
        isNow,
    });

    useEffect(() => {
        if (inputMode === 'fixed') {
            setValue(`${field}Fixed`, defaultValues.dateTime);
        } else if (inputMode === 'duration') {
            setValue(`${field}Duration`, defaultValues.duration);
        }
        trigger(field);
    }, [inputMode, field]);

    const handleModeChange = useCallback(
        (newMode: string) => {
            setValue(`${field}Mode`, newMode);
        },
        [setValue, field],
    );

    const validateFixedDateTime = useCallback(
        (value: ICreateProposalFormFixedDateTime) => {
            if (inputMode !== 'fixed') {
                return true;
            }
            if (isStartField) {
                return true; // No validation for start time
            }

            const selectedDateTime = DateTime.fromISO(`${value.date}T${value.time}`);
            const minDateTime = DateTime.now().plus({ seconds: minDuration });

            if (startTime) {
                const startDateTime = DateTime.fromISO(`${startTime.date}T${startTime.time}`);
                if (selectedDateTime <= startDateTime) {
                    return 'End time must be after the start time';
                }
            }

            if (selectedDateTime < minDateTime) {
                return 'End time must be at least one hour in the future';
            }

            return true;
        },
        [inputMode, isStartField, minDuration, startTime],
    );

    const validateDuration = useCallback(
        (value: ICreateProposalFormDuration) => {
            if (inputMode !== 'duration') {
                return true;
            }

            const duration = Duration.fromObject(value);
            const minDurationDuration = Duration.fromObject({ seconds: minDuration });

            if (duration < minDurationDuration) {
                return false;
            }

            return true;
        },
        [inputMode, minDuration],
    );

    const handleFixedDateTimeChange = (type: 'date' | 'time') => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = { ...fixedDateTimeField.value, [type]: event.target.value };
        setValue(`${field}Fixed`, newValue, { shouldValidate: false });
        clearErrors(`${field}Fixed`);
        trigger(`${field}Fixed`);
    };

    const handleDurationChange = (type: 'days' | 'hours' | 'minutes') => (value: string) => {
        const numericValue = parseInt(value, 10) || 0;
        const newValue = { ...durationField.value, [type]: numericValue };
        setValue(`${field}Duration`, newValue, { shouldValidate: false });
        clearErrors(`${field}Duration`);
        trigger(`${field}Duration`);
    };

    const fixedDateTimeField = useFormField(`${field}Fixed`, {
        rules: {
            validate: validateFixedDateTime,
        },
        defaultValue: defaultValues.dateTime,
    });

    const durationField = useFormField(`${field}Duration`, {
        rules: {
            validate: validateDuration,
        },
        defaultValue: defaultValues.duration,
    });

    const fixedErrors = !!fixedDateTimeField.alert;
    const durationErrors = !!durationField.alert;

    return (
        <>
            <RadioGroup
                {...modeField}
                label={label}
                className="flex gap-4 md:!flex-row"
                helpText={helpText}
                value={inputMode}
                onValueChange={handleModeChange}
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
                            label="Date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full md:w-1/3"
                            value={fixedDateTimeField.value.date}
                            onChange={handleFixedDateTimeChange('date')}
                        />
                        <InputTime
                            label="Time"
                            className="w-full md:w-1/3"
                            value={fixedDateTimeField.value.time}
                            onChange={handleFixedDateTimeChange('time')}
                        />
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
                            value={durationField.value.minutes}
                            onChange={handleDurationChange('minutes')}
                        />
                        <InputNumber
                            min={0}
                            max={23}
                            className="w-full md:w-1/3"
                            placeholder="0 h"
                            value={durationField.value.hours}
                            onChange={handleDurationChange('hours')}
                        />
                        <InputNumber
                            min={0}
                            className="w-full md:w-1/3"
                            placeholder="7 d"
                            value={durationField.value.days}
                            onChange={handleDurationChange('days')}
                        />
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
