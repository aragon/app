import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils, type IDateDuration } from '@/shared/utils/createProposalUtils';
import { AlertCard, Card, InputNumber } from '@aragon/ods';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import type { IAdvancedDateInputBaseProps } from './advancedDateInput.api';

export interface IAdvancedDateInputDurationProps
    extends Omit<IAdvancedDateInputBaseProps, 'minTime'>,
        ComponentProps<'div'> {}

export const AdvancedDateInputDuration: React.FC<IAdvancedDateInputDurationProps> = (props) => {
    const { minDuration, field, label, infoText, validateMinDuration, className, ...otherProps } = props;
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    const validateDuration = (value: IDateDuration) =>
        validateMinDuration ? dateUtils.validateDuration({ value, minDuration }) : true;

    const durationField = useFormField<Record<string, IDateDuration>, typeof field>(field, {
        rules: { validate: validateDuration },
        label,
        shouldUnregister: true,
        defaultValue: minDuration,
    });

    const handleDurationChange = (type: string) => (value: string) => {
        const parsedValue = parseInt(value, 10);
        const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
        const newValue = { ...durationField.value, [type]: numericValue };
        setValue(field, newValue, { shouldValidate: false });
    };

    const handleInputBlur = () => trigger(field);

    const alertDescription = durationField.alert?.message ?? infoText;
    const alertVariant = durationField.alert != null ? 'critical' : 'info';

    return (
        <Card className={classNames('flex flex-col gap-4 p-6', className)} {...otherProps}>
            <div className="flex flex-col justify-between gap-4 md:flex-row">
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.minutes')}
                    min={0}
                    max={59}
                    className="w-full md:w-1/3"
                    placeholder="0 min"
                    value={durationField.value.minutes}
                    onChange={handleDurationChange('minutes')}
                    onBlur={handleInputBlur}
                />
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.hours')}
                    min={0}
                    max={23}
                    className="w-full md:w-1/3"
                    placeholder="0 h"
                    value={durationField.value.hours}
                    onChange={handleDurationChange('hours')}
                    onBlur={handleInputBlur}
                />
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.days')}
                    min={0}
                    className="w-full md:w-1/3"
                    placeholder="7 d"
                    value={durationField.value.days}
                    onChange={handleDurationChange('days')}
                    onBlur={handleInputBlur}
                />
            </div>
            {alertDescription && <AlertCard message={label} description={alertDescription} variant={alertVariant} />}
        </Card>
    );
};
