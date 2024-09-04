import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/createProposalUtils';
import { AlertCard, Card, InputDate, InputText, InputTime } from '@aragon/ods';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '../translationsProvider';
import { DateTimeFields, type IAdvancedDateInputDateFixed, type IAdvancedDateInputProps } from './advancedInput.api';

export type IAdvancedDateInputFixedProps = Pick<
    IAdvancedDateInputProps,
    'field' | 'label' | 'infoText' | 'minDuration' | 'isStartField'
> & {
    startTime?: IAdvancedDateInputDateFixed;
};
export const AdvancedDateInputFixed: React.FC<IAdvancedDateInputFixedProps> = (props) => {
    const { field, label, infoText, minDuration = 0, startTime, isStartField = false } = props;
    const { t } = useTranslations();

    const { setValue, trigger } = useFormContext();

    const getDefaultDateTime = useCallback(() => {
        return dateUtils.getStartDate({ minDuration, startTime, isNow: isStartField });
    }, [minDuration, startTime, isStartField]);

    const handleFixedDateTimeChange = (type: DateTimeFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = { ...fixedDateTimeField.value, [type]: event.target.value };
        setValue(`${field}Fixed`, newValue, { shouldValidate: false });
        trigger(`${field}Fixed`);
    };

    const validateFixedDateTime = useCallback(
        (value: IAdvancedDateInputDateFixed) => {
            if (isStartField) {
                return true;
            }

            const selectedDateTime = DateTime.fromISO(`${value.date}T${value.time}`);
            const now = DateTime.now();
            const minDateTime = now.plus({ seconds: minDuration });

            if (startTime) {
                const startDateTime = DateTime.fromISO(`${startTime.date}T${startTime.time}`);
                const minEndDateTime = startDateTime.plus({ seconds: minDuration });

                if (selectedDateTime <= startDateTime) {
                    return false;
                }

                if (selectedDateTime < minEndDateTime) {
                    return false;
                }
            } else {
                if (selectedDateTime < minDateTime) {
                    return false;
                }
            }

            return true;
        },
        [isStartField, minDuration, startTime],
    );
    const fixedDateTimeField = useFormField(`${field}Fixed`, {
        rules: {
            validate: validateFixedDateTime,
        },
        defaultValue: getDefaultDateTime(),
        shouldUnregister: true,
    });

    const fixedErrors = !!fixedDateTimeField.alert;

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
            {(infoText ?? fixedErrors) && (
                <AlertCard
                    message={label}
                    description={fixedErrors ? t('app.shared.advancedDateInput.invalid', { label }) : infoText}
                    variant={fixedErrors ? 'critical' : 'info'}
                />
            )}
        </Card>
    );
};
