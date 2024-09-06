import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils, type IDateDuration } from '@/shared/utils/createProposalUtils';
import { AlertCard, Card, InputNumber } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../translationsProvider';
import type { IAdvancedDateInputFixedProps } from './advancedDateInputFixed';

export type IAdvancedDateInputDurationProps = Pick<
    IAdvancedDateInputFixedProps,
    'field' | 'label' | 'infoText' | 'minDuration' | 'validateMinDuration'
>;

export const AdvancedDateInputDuration: React.FC<IAdvancedDateInputDurationProps> = (props) => {
    const { minDuration, field, label, infoText, validateMinDuration } = props;
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    const validateDuration = (value: IDateDuration) =>
        validateMinDuration ? dateUtils.validateDuration({ value, minDuration }) : true;

    const handleDurationChange = (type: string) => (value: string) => {
        const numericValue = parseInt(value, 10) || 0;
        const newValue = { ...durationField.value, [type]: numericValue };
        setValue(`${field}Duration`, newValue, { shouldValidate: false });
    };

    const durationField = useFormField(`${field}Duration`, {
        rules: {
            validate: validateDuration,
        },
        label,
        shouldUnregister: true,
        defaultValue: minDuration,
    });

    const alertDescription = durationField.alert?.message ?? infoText;

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
                    onChange={handleDurationChange('minutes')}
                    onBlur={() => trigger(`${field}Duration`)}
                />
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.hours')}
                    min={0}
                    max={23}
                    className="w-full md:w-1/3"
                    placeholder="0 h"
                    value={durationField.value.hours}
                    onChange={handleDurationChange('hours')}
                    onBlur={() => trigger(`${field}Duration`)}
                />
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.days')}
                    min={0}
                    className="w-full md:w-1/3"
                    placeholder="7 d"
                    value={durationField.value.days}
                    onChange={handleDurationChange('days')}
                    onBlur={() => trigger(`${field}Duration`)}
                />
            </div>
            {alertDescription && (
                <AlertCard
                    message={label}
                    description={alertDescription}
                    variant={durationField.alert?.message ? 'critical' : 'info'}
                />
            )}
        </Card>
    );
};
