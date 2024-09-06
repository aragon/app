import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/createProposalUtils';
import { AlertCard, Card, InputDate, InputText, InputTime } from '@aragon/ods';
import { DateTime } from 'luxon';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../translationsProvider';
import { DateTimeFields, type IAdvancedDateInputDateFixed, type IAdvancedDateInputProps } from './advancedInput.api';

export type IAdvancedDateInputFixedProps = Pick<
    IAdvancedDateInputProps,
    'field' | 'label' | 'infoText' | 'minDuration' | 'minTime' | 'validateMinDuration'
> & {
    startTime?: IAdvancedDateInputDateFixed;
};
export const AdvancedDateInputFixed: React.FC<IAdvancedDateInputFixedProps> = (props) => {
    const { field, label, infoText, minDuration, minTime, validateMinDuration } = props;
    const { t } = useTranslations();

    const { setValue, trigger } = useFormContext();

    const handleFixedDateTimeChange = (type: DateTimeFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = { ...fixedDateTimeField.value, [type]: event.target.value };
        setValue(`${field}Fixed`, newValue, { shouldValidate: false });
        trigger(`${field}Fixed`);
    };

    const validateFixedDateTime = (value: IAdvancedDateInputDateFixed): boolean => {
        if (!value.date.length || !value.time.length) {
            return false;
        }
        const parsedValue = dateUtils.parseFixedDate(value);
        if (minTime && parsedValue < minTime) {
            return false;
        }
        if (validateMinDuration && minTime && minDuration && parsedValue < minTime.plus(minDuration)) {
            return false;
        }
        return true;
    };

    const { days = 0, hours = 0, minutes = 0 } = minDuration ?? {};

    const defaultValue = (minTime ?? DateTime.now()).plus({ days, hours, minutes });

    const fixedDateTimeField = useFormField(`${field}Fixed`, {
        rules: {
            validate: validateFixedDateTime,
        },
        shouldUnregister: true,
        label,
        defaultValue: {
            date: defaultValue.toFormat('yyyy-MM-dd'),
            time: defaultValue.toFormat('HH:mm'),
        },
    });

    const hasError = !!fixedDateTimeField.alert;

    return (
        <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
                <InputDate
                    label={t('app.shared.advancedDateInput.fixed.date')}
                    min={DateTime.now().toFormat('yyyy-MM-dd')}
                    className="w-full md:w-1/3"
                    value={fixedDateTimeField.value.date}
                    onChange={handleFixedDateTimeChange(DateTimeFields.DATE)}
                />
                <InputTime
                    label={t('app.shared.advancedDateInput.fixed.time')}
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
            {(infoText ?? hasError) && (
                <AlertCard
                    message={label}
                    description={hasError ? fixedDateTimeField.alert?.message : infoText}
                    variant={hasError ? 'critical' : 'info'}
                />
            )}
        </Card>
    );
};
