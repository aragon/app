import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateFixed } from '@/shared/utils/dateUtils';
import { dateUtils } from '@/shared/utils/dateUtils/dateUtils';
import { AlertCard, Card, InputDate, InputText, InputTime } from '@aragon/ods';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../../translationsProvider';
import type { IAdvancedDateInputBaseProps } from './advancedDateInput.api';

export interface IAdvancedDateInputFixedProps extends IAdvancedDateInputBaseProps, ComponentProps<'div'> {}

export const AdvancedDateInputFixed: React.FC<IAdvancedDateInputFixedProps> = (props) => {
    const { field, label, infoText, minDuration, minTime, validateMinDuration, className, ...otherProps } = props;
    const { t } = useTranslations();

    const { setValue, trigger } = useFormContext();

    const { days = 0, hours = 0, minutes = 0 } = minDuration ?? {};
    const defaultValue = (minTime ?? DateTime.now()).plus({ days, hours, minutes });

    const validateFixedTime = (value: IDateFixed) =>
        validateMinDuration ? dateUtils.validateFixedTime({ value, minTime, minDuration }) : true;

    const fixedDateField = useFormField<Record<string, IDateFixed>, typeof field>(field, {
        rules: { validate: validateFixedTime },
        shouldUnregister: true,
        label,
        defaultValue: dateUtils.dateToFixedDate(defaultValue) ?? undefined,
    });

    const handleFixedDateTimeChange = (type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = { ...fixedDateField.value, [type]: event.target.value };
        setValue(field, newValue, { shouldValidate: false });
    };

    const handleInputBlur = () => trigger(field);

    const alertDescription = fixedDateField.alert?.message ?? infoText;
    const alertVariant = fixedDateField.alert != null ? 'critical' : 'info';

    return (
        <Card className={classNames('flex flex-col gap-4 p-6', classNames)} {...otherProps}>
            <div className="flex flex-col justify-between gap-4 md:flex-row">
                <InputDate
                    label={t('app.shared.advancedDateInput.fixed.date')}
                    min={DateTime.now().toFormat('yyyy-MM-dd')}
                    className="w-full md:w-1/3"
                    value={fixedDateField.value.date}
                    onChange={handleFixedDateTimeChange('date')}
                    onBlur={handleInputBlur}
                />
                <InputTime
                    label={t('app.shared.advancedDateInput.fixed.time')}
                    className="w-full md:w-1/3"
                    value={fixedDateField.value.time}
                    onChange={handleFixedDateTimeChange('time')}
                    onBlur={handleInputBlur}
                />
                <InputText
                    className="w-full md:w-1/3"
                    label={t('app.shared.advancedDateInput.now')}
                    placeholder="UTC +2"
                    disabled={true}
                />
            </div>
            {alertDescription && <AlertCard message={label} description={alertDescription} variant={alertVariant} />}
        </Card>
    );
};
