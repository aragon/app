import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateFixed } from '@/shared/utils/createProposalUtils';
import { dateUtils } from '@/shared/utils/createProposalUtils/dateUtils';
import { AlertCard, Card, InputDate, InputText, InputTime } from '@aragon/ods';
import { DateTime } from 'luxon';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../translationsProvider';
import type { IAdvancedDateInputProps } from './advancedDateInput.api';

export type IAdvancedDateInputFixedProps = Pick<
    IAdvancedDateInputProps,
    'field' | 'label' | 'infoText' | 'minDuration' | 'minTime' | 'validateMinDuration'
>;

export const AdvancedDateInputFixed: React.FC<IAdvancedDateInputFixedProps> = (props) => {
    const { field, label, infoText, minDuration, minTime, validateMinDuration } = props;
    const { t } = useTranslations();

    const { setValue, trigger } = useFormContext();

    const handleFixedDateTimeChange = (type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = { ...fixedDateField.value, [type]: event.target.value };
        setValue(`${field}Fixed`, newValue, { shouldValidate: false });
    };

    const validateFixedTime = (value: IDateFixed) =>
        validateMinDuration ? dateUtils.validateFixedTime({ value, minTime, minDuration }) : true;

    const { days = 0, hours = 0, minutes = 0 } = minDuration ?? {};

    const defaultValue = (minTime ?? DateTime.now()).plus({ days, hours, minutes });

    const fixedDateField = useFormField(`${field}Fixed`, {
        rules: {
            validate: validateFixedTime,
        },
        shouldUnregister: true,
        label,
        defaultValue: dateUtils.dateToFixedDate(defaultValue),
    });

    const alertDescription = fixedDateField.alert?.message ?? infoText;

    return (
        <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
                <InputDate
                    label={t('app.shared.advancedDateInput.fixed.date')}
                    min={DateTime.now().toFormat('yyyy-MM-dd')}
                    className="w-full md:w-1/3"
                    value={fixedDateField.value.date}
                    onChange={handleFixedDateTimeChange('date')}
                    onBlur={() => trigger(`${field}Fixed`)}
                />
                <InputTime
                    label={t('app.shared.advancedDateInput.fixed.time')}
                    className="w-full md:w-1/3"
                    value={fixedDateField.value.time}
                    onChange={handleFixedDateTimeChange('time')}
                    onBlur={() => trigger(`${field}Fixed`)}
                />
                <InputText
                    className="w-full md:w-1/3"
                    label={t('app.shared.advancedDateInput.now')}
                    placeholder="UTC +2"
                    disabled={true}
                />
            </div>
            {alertDescription && (
                <AlertCard
                    message={label}
                    description={alertDescription}
                    variant={fixedDateField.alert?.message ? 'critical' : 'info'}
                />
            )}
        </Card>
    );
};
