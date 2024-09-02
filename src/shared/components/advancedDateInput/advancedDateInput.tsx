import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputDate, InputNumber, InputText, InputTime, RadioCard, RadioGroup } from '@aragon/ods';
import { useCallback, useEffect } from 'react';
import { useDefaultValues } from './utils/defaultValues';
import { DateTime, Duration } from 'luxon';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    DateTimeFields,
    DurationFields,
    type IAdvancedDateInputProps,
    type ICreateProposalFormDuration,
    type ICreateProposalFormFixedDateTime,
    InputModeOptions,
} from './types';
import { useTranslations } from '../translationsProvider';

export const AdvancedDateInput: React.FC<IAdvancedDateInputProps> = ({
    useDuration = false,
    label,
    helpText,
    minDuration = 0,
    startTime,
    isStartField = false,
    field,
    infoText,
}) => {
    const { t } = useTranslations();

    const { clearErrors, setValue, trigger } = useFormContext();

    const modeField = useFormField(`${field}Mode`, {
        defaultValue: useDuration ? InputModeOptions.DURATION : InputModeOptions.NOW,
    });

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
        if (inputMode === InputModeOptions.FIXED) {
            setValue(`${field}Fixed`, defaultValues.dateTime);
        } else if (inputMode === InputModeOptions.DURATION) {
            setValue(`${field}Duration`, defaultValues.duration);
        }
        trigger(field);
    }, [inputMode, field]);

    const handleModeChange = useCallback(
        (newMode: string) => {
            setValue(`${field}Mode`, newMode as InputModeOptions);
        },
        [setValue, field],
    );

    const validateFixedDateTime = useCallback(
        (value: ICreateProposalFormFixedDateTime) => {
            if (inputMode !== InputModeOptions.FIXED) {
                return true;
            }
            if (isStartField) {
                return true; // No validation needed for start time
            }

            const selectedDateTime = DateTime.fromISO(`${value.date}T${value.time}`);
            const now = DateTime.now();
            const minDateTime = now.plus({ seconds: minDuration });

            if (startTime) {
                const startDateTime = DateTime.fromISO(`${startTime.date}T${startTime.time}`);
                const minEndDateTime = startDateTime.plus({ seconds: minDuration });

                if (selectedDateTime <= startDateTime) {
                    return false;
                }

                if (selectedDateTime < minEndDateTime) {
                    return false;
                }
            } else {
                if (selectedDateTime < minDateTime) {
                    return false;
                }
            }

            return true;
        },
        [inputMode, isStartField, minDuration, startTime],
    );

    const validateDuration = useCallback(
        (value: ICreateProposalFormDuration) => {
            if (inputMode !== InputModeOptions.DURATION) {
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

    const handleFixedDateTimeChange = (type: DateTimeFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = { ...fixedDateTimeField.value, [type]: event.target.value };
        setValue(`${field}Fixed`, newValue, { shouldValidate: false });
        clearErrors(`${field}Fixed`);
        trigger(`${field}Fixed`);
    };

    const handleDurationChange = (type: DurationFields) => (value: string) => {
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
                    label={
                        useDuration ? t('app.shared.advancedDateInput.duration') : t('app.shared.advancedDateInput.now')
                    }
                    description=""
                    value={useDuration ? InputModeOptions.DURATION : InputModeOptions.NOW}
                />
                <RadioCard
                    className="w-full"
                    label={t('app.shared.advancedDateInput.specific')}
                    description=""
                    value="fixed"
                />
            </RadioGroup>
            {inputMode === InputModeOptions.FIXED && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <InputDate
                            label={t('app.shared.advancedDateInput.date')}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full md:w-1/3"
                            value={fixedDateTimeField.value.date}
                            onChange={handleFixedDateTimeChange(DateTimeFields.DATE)}
                        />
                        <InputTime
                            label={t('app.shared.advancedDateInput.time')}
                            className="w-full md:w-1/3"
                            value={fixedDateTimeField.value.time}
                            onChange={handleFixedDateTimeChange(DateTimeFields.TIME)}
                        />
                        <InputText
                            className="w-full md:w-1/3"
                            label={t('app.shared.advancedDateInput.now')}
                            placeholder="UTC +2"
                            disabled={true}
                        />
                    </div>
                    {!isStartField && (
                        <AlertCard
                            message={label}
                            description={fixedErrors ? t('app.shared.advancedDateInput.invalid', { label }) : infoText}
                            variant={fixedErrors ? 'critical' : 'info'}
                        />
                    )}
                </Card>
            )}
            {inputMode === InputModeOptions.DURATION && (
                <Card className="flex flex-col gap-4 p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <InputNumber
                            min={0}
                            max={59}
                            className="w-full md:w-1/3"
                            placeholder="0 min"
                            value={durationField.value.minutes}
                            onChange={handleDurationChange(DurationFields.MINUTES)}
                        />
                        <InputNumber
                            min={0}
                            max={23}
                            className="w-full md:w-1/3"
                            placeholder="0 h"
                            value={durationField.value.hours}
                            onChange={handleDurationChange(DurationFields.HOURS)}
                        />
                        <InputNumber
                            min={0}
                            className="w-full md:w-1/3"
                            placeholder="7 d"
                            value={durationField.value.days}
                            onChange={handleDurationChange(DurationFields.DAYS)}
                        />
                    </div>
                    <AlertCard
                        message={label}
                        description={durationErrors ? t('app.shared.advancedDateInput.invalid', { label }) : infoText}
                        variant={durationErrors ? 'critical' : 'info'}
                    />
                </Card>
            )}
        </>
    );
};
