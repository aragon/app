import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils, type IDateDuration } from '@/shared/utils/dateUtils';
import { Card, InputNumber } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import type { IAdvancedDateInputBaseProps } from './advancedDateInput.api';
import { AdvancedDateInputInfoText } from './advancedDateInputInfoText';

export interface IAdvancedDateInputDurationProps
    extends Omit<IAdvancedDateInputBaseProps, 'minTime'>,
        Omit<ComponentProps<'div'>, 'defaultValue'> {
    /**
     * Default value for the duration date. Defaults to minDuration or 0 days, 0 hours, 0 minutes.
     */
    defaultValue?: IDateDuration;
}

export const AdvancedDateInputDuration: React.FC<IAdvancedDateInputDurationProps> = (props) => {
    const {
        minDuration,
        field,
        label,
        infoText,
        infoDisplay,
        validateMinDuration,
        className,
        defaultValue,
        ...otherProps
    } = props;
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    const validateDuration = (value: IDateDuration) =>
        validateMinDuration ? dateUtils.validateDuration({ value, minDuration }) : true;

    const processedDefaultValue = minDuration ?? { days: 0, hours: 0, minutes: 0 };

    const durationField = useFormField<Record<string, IDateDuration>, typeof field>(field, {
        rules: { validate: validateDuration },
        label,
        defaultValue: processedDefaultValue,
    });

    const handleDurationChange = (type: string) => (value: string) => {
        const parsedValue = parseInt(value, 10);
        const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
        const newValue = { ...durationField.value, [type]: numericValue };
        setValue(field, newValue, { shouldValidate: false });
    };

    const handleInputBlur = () => trigger(field);

    return (
        <Card className={classNames('flex flex-col gap-4 p-6 shadow-neutral-sm', className)} {...otherProps}>
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
                    suffix="min"
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
                    suffix="h"
                />
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.days')}
                    min={0}
                    className="w-full md:w-1/3"
                    placeholder="0 d"
                    value={durationField.value.days}
                    onChange={handleDurationChange('days')}
                    onBlur={handleInputBlur}
                    suffix="d"
                />
            </div>
            <AdvancedDateInputInfoText field={durationField} infoText={infoText} infoDisplay={infoDisplay} />
        </Card>
    );
};
