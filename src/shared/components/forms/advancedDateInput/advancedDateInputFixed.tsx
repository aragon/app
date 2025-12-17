import { Card, InputDate, InputText, InputTime } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormField } from '@/shared/hooks/useFormField';
import { sanitizePlainText } from '@/shared/security';
import type { IDateFixed } from '@/shared/utils/dateUtils';
import { dateUtils } from '@/shared/utils/dateUtils/dateUtils';
import { timeUtils } from '@/shared/utils/timeUtils/timeUtils';
import { useTranslations } from '../../translationsProvider';
import type { IAdvancedDateInputBaseProps } from './advancedDateInput.api';
import { AdvancedDateInputInfoText } from './advancedDateInputInfoText';

export interface IAdvancedDateInputFixedProps extends IAdvancedDateInputBaseProps, ComponentProps<'div'> {}

export const AdvancedDateInputFixed: React.FC<IAdvancedDateInputFixedProps> = (props) => {
    const { field, label, infoText, minDuration, minTime, validateMinDuration, className, infoDisplay, ...otherProps } = props;
    const { t } = useTranslations();

    const { setValue, trigger } = useFormContext();

    const { days = 0, hours = 0, minutes = 0 } = minDuration ?? {};
    const defaultValue = minTime.plus({ days, hours, minutes });

    const validateFixedTime = (value: IDateFixed) =>
        dateUtils.validateFixedTime({
            value,
            minTime,
            minDuration: validateMinDuration ? minDuration : undefined,
        });

    const fixedDateField = useFormField<Record<string, IDateFixed>, typeof field>(field, {
        rules: { validate: validateFixedTime },
        label,
        defaultValue: dateUtils.dateToFixedDate(defaultValue) ?? undefined,
    });

    const handleFixedDateTimeChange = (type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const sanitizedValue = sanitizePlainText(event.target.value);
        const normalizedValue = type === 'time' ? timeUtils.normalizeTimeValue(sanitizedValue) : sanitizedValue;
        const newValue = {
            ...fixedDateField.value,
            [type]: normalizedValue,
        };
        setValue(field, newValue, { shouldValidate: false });
    };

    const handleInputBlur = () => trigger(field);

    return (
        <Card className={classNames('flex flex-col gap-4 p-6 shadow-neutral-sm', className)} {...otherProps}>
            <div className="flex flex-col justify-between gap-4 md:flex-row">
                <InputDate
                    className="w-full md:w-1/3"
                    label={t('app.shared.advancedDateInput.fixed.date')}
                    min={DateTime.now().toFormat('yyyy-MM-dd')}
                    onBlur={handleInputBlur}
                    onChange={handleFixedDateTimeChange('date')}
                    value={fixedDateField.value.date}
                />
                <InputTime
                    className="w-full md:w-1/3"
                    label={t('app.shared.advancedDateInput.fixed.time')}
                    onBlur={handleInputBlur}
                    onChange={handleFixedDateTimeChange('time')}
                    value={fixedDateField.value.time}
                />
                <InputText
                    className="w-full md:w-1/3"
                    disabled={true}
                    label={t('app.shared.advancedDateInput.timezone')}
                    placeholder="UTC +2"
                />
            </div>
            <AdvancedDateInputInfoText field={fixedDateField} infoDisplay={infoDisplay} infoText={infoText} />
        </Card>
    );
};
