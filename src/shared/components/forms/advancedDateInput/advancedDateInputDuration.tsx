import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils, type IDateDuration } from '@/shared/utils/dateUtils';
import { Card, InputNumber } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { Duration } from 'luxon';
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
    /**
     * Exposes the duration as seconds on the form when set to true.
     */
    useSecondsFormat?: boolean;
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
        useSecondsFormat,
        ...otherProps
    } = props;
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    const validateDuration = (value: IDateDuration | number) => {
        const isValid = dateUtils.validateDuration({ value, minDuration });
        const durationError = 'app.shared.advancedDateInput.duration.error.minDuration';

        return validateMinDuration && !isValid ? durationError : true;
    };

    const processedDefaultValue = defaultValue ?? minDuration ?? { days: 0, hours: 0, minutes: 0 };
    const formattedDefaultValue = useSecondsFormat
        ? dateUtils.durationToSeconds(processedDefaultValue)
        : processedDefaultValue;

    const alertValue = Duration.fromObject(minDuration ?? {})
        .rescale()
        .toHuman();
    const durationField = useFormField<Record<string, IDateDuration | number>, typeof field>(field, {
        rules: { validate: validateDuration },
        label,
        defaultValue: formattedDefaultValue,
        alertValue: { value: alertValue },
    });

    const currentDurationObject =
        typeof durationField.value === 'object'
            ? durationField.value
            : dateUtils.secondsToDuration(durationField.value);

    const handleDurationChange = (type: string) => (value: string) => {
        const parsedValue = parseInt(value, 10);
        const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
        const newValue = { ...currentDurationObject, [type]: numericValue };
        const processedNewValue = useSecondsFormat ? dateUtils.durationToSeconds(newValue) : newValue;
        setValue(field, processedNewValue, { shouldValidate: false });
    };

    const handleInputBlur = () => trigger(field);

    return (
        <Card className={classNames('shadow-neutral-sm flex flex-col gap-4 p-6', className)} {...otherProps}>
            <div className="flex flex-col justify-between gap-4 md:flex-row">
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.minutes')}
                    min={0}
                    max={59}
                    className="w-full md:w-1/3"
                    placeholder="0 min"
                    value={currentDurationObject.minutes}
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
                    value={currentDurationObject.hours}
                    onChange={handleDurationChange('hours')}
                    onBlur={handleInputBlur}
                    suffix="h"
                />
                <InputNumber
                    label={t('app.shared.advancedDateInput.duration.days')}
                    min={0}
                    className="w-full md:w-1/3"
                    placeholder="0 d"
                    value={currentDurationObject.days}
                    onChange={handleDurationChange('days')}
                    onBlur={handleInputBlur}
                    suffix="d"
                />
            </div>
            <AdvancedDateInputInfoText field={durationField} infoText={infoText} infoDisplay={infoDisplay} />
        </Card>
    );
};
