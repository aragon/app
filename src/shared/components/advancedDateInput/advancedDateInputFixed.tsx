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
    'field' | 'label' | 'infoText' | 'minDuration'
> & {
    startTime?: IAdvancedDateInputDateFixed;
};
export const AdvancedDateInputFixed: React.FC<IAdvancedDateInputFixedProps> = (props) => {
    const { field, label, infoText, minDuration = 0, startTime } = props;
    const { t } = useTranslations();

    const { setValue, trigger } = useFormContext();

    const getDefaultDateTime = useCallback(() => {
        return dateUtils.getStartDate({
            minDuration: minDuration ?? 0,
            startTime,
            isStart: !minDuration && !startTime,
        });
    }, [minDuration, startTime]);

    const handleFixedDateTimeChange = (type: DateTimeFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = { ...fixedDateTimeField.value, [type]: event.target.value };
        setValue(`${field}Fixed`, newValue, { shouldValidate: false });
        trigger(`${field}Fixed`);
    };

    const validateFixedDateTime = useCallback(
        (value: IAdvancedDateInputDateFixed): boolean => {
            // No validation needed if there's no minDuration and no startTime
            if (!minDuration && !startTime) {
                return true;
            }
            // Trigger validation if either date or time is missing
            if (!value.date || !value.time) {
                return false;
            }
            const selectedDateTime = dateUtils.parseFixedDate(value);
            const now = DateTime.now();
            const minDateTime = now.plus({ seconds: minDuration });

            if (startTime) {
                const startDateTime = dateUtils.parseFixedDate(startTime);
                const minEndDateTime = startDateTime.plus({ seconds: minDuration });
                // Fail if selected time is not after start time or < minDuration
                return selectedDateTime > startDateTime && selectedDateTime >= minEndDateTime;
            }
            // If no startTime, just check against minDuration
            return selectedDateTime >= minDateTime;
        },
        [minDuration, startTime],
    );

    const fixedDateTimeField = useFormField(`${field}Fixed`, {
        rules: {
            validate: validateFixedDateTime,
        },
        shouldUnregister: true,
        label,
        defaultValue: getDefaultDateTime(),
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
                    description={fixedErrors ? fixedDateTimeField.alert?.message : infoText}
                    variant={fixedErrors ? 'critical' : 'info'}
                />
            )}
        </Card>
    );
};
