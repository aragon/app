import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/createProposalUtils';
import { AlertCard, Card, InputNumber } from '@aragon/ods';
import { Duration } from 'luxon';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../translationsProvider';
import { DurationFields, type IAdvancedDateInputDateDuration, type IAdvancedDateInputProps } from './advancedInput.api';

export type IAdvancedDateInputDurationProps = Pick<
    IAdvancedDateInputProps,
    'field' | 'label' | 'infoText' | 'minDuration'
>;

export const AdvancedDateInputDuration: React.FC<IAdvancedDateInputDurationProps> = (props) => {
    const { minDuration = 0, field, label, infoText } = props;
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    const getDefaultDuration = useCallback(() => {
        const defaultDuration = { days: 5, hours: 0, minutes: 0 };
        return dateUtils.secondsToDaysHoursMinutes(minDuration) ?? defaultDuration;
    }, [minDuration]);

    const validateDuration = useCallback(
        (value: IAdvancedDateInputDateDuration) => {
            const duration = Duration.fromObject(value);
            const minDurationDuration = Duration.fromObject({ seconds: minDuration });

            if (duration < minDurationDuration) {
                return false;
            }

            return true;
        },
        [minDuration],
    );

    const handleDurationChange = (type: DurationFields) => (value: string) => {
        const numericValue = parseInt(value, 10) || 0;
        const newValue = { ...durationField.value, [type]: numericValue };
        setValue(`${field}Duration`, newValue, { shouldValidate: false });
        trigger(`${field}Duration`);
    };

    const durationField = useFormField(`${field}Duration`, {
        rules: {
            validate: validateDuration,
        },
        shouldUnregister: true,
        defaultValue: getDefaultDuration(),
    });

    const durationErrors = !!durationField.alert;

    return (
        <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.minutes')}
                    min={0}
                    max={59}
                    className="w-full md:w-1/3"
                    placeholder="0 min"
                    value={durationField.value.minutes}
                    onChange={handleDurationChange(DurationFields.MINUTES)}
                />
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.hours')}
                    min={0}
                    max={23}
                    className="w-full md:w-1/3"
                    placeholder="0 h"
                    value={durationField.value.hours}
                    onChange={handleDurationChange(DurationFields.HOURS)}
                />
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.days')}
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
    );
};
