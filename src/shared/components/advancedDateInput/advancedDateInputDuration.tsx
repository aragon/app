import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputNumber } from '@aragon/ods';
import { Duration } from 'luxon';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../translationsProvider';
import { DurationFields, type IAdvancedDateInputDateDuration, type IAdvancedDateInputProps } from './advancedInput.api';

export type IAdvancedDateInputDurationProps = Pick<
    IAdvancedDateInputProps,
    'field' | 'label' | 'infoText' | 'minDuration' | 'validateMinDuration'
>;

export const AdvancedDateInputDuration: React.FC<IAdvancedDateInputDurationProps> = (props) => {
    const { minDuration, field, label, infoText, validateMinDuration } = props;
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    const validateDuration = (value: IAdvancedDateInputDateDuration) => {
        if (validateMinDuration && minDuration) {
            return Duration.fromObject(value) >= Duration.fromObject(minDuration);
        }
        return true;
    };

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
        label,
        shouldUnregister: true,
        defaultValue: minDuration ?? { days: 5, hours: 0, minutes: 0 },
    });

    const hasError = !!durationField.alert;

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
                description={hasError ? durationField.alert?.message : infoText}
                variant={hasError ? 'critical' : 'info'}
            />
        </Card>
    );
};
