import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils, type IDateDuration } from '@/shared/utils/dateUtils';
import { Card, InputNumber, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useFormContext, useWatch } from 'react-hook-form';
import { PolicyDispatchIntervalType } from '../createPolicyFormDefinitions';

export interface ICreatePolicyFormIntervalProps {
    /**
     * Prefix to prepend to all the interval form fields.
     */
    fieldPrefix?: string;
}

const defaultCooldownDuration = { days: 0, hours: 0, minutes: 0 };

export const CreatePolicyFormInterval: React.FC<ICreatePolicyFormIntervalProps> = (props) => {
    const { fieldPrefix } = props;
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    const intervalFieldName = fieldPrefix ? `${fieldPrefix}.dispatchInterval` : 'dispatchInterval';
    const intervalTypeFieldName = `${intervalFieldName}.type` as any;
    const cooldownDurationFieldName = `${intervalFieldName}.cooldownDuration` as any;

    const { onChange: onIntervalTypeChange, ...intervalTypeField } = useFormField<Record<string, any>, any>(
        intervalTypeFieldName,
        {
            defaultValue: PolicyDispatchIntervalType.CONTINUOUS,
        },
    );

    const cooldownDurationField = useFormField<Record<string, any>, any>(cooldownDurationFieldName, {
        defaultValue: dateUtils.durationToSeconds(defaultCooldownDuration),
        rules: {
            validate: (value) => {
                if (intervalTypeField.value === PolicyDispatchIntervalType.COOLDOWN) {
                    if (value == null || value === 0) {
                        return t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.duration.error');
                    }
                }
                return true;
            },
        },
    });

    const selectedIntervalType = useWatch({
        name: intervalTypeFieldName,
    }) as PolicyDispatchIntervalType;

    const currentDuration =
        typeof cooldownDurationField.value === 'number'
            ? dateUtils.secondsToDuration(cooldownDurationField.value)
            : defaultCooldownDuration;

    const handleDurationChange = (type: keyof IDateDuration) => (value: string) => {
        const parsedValue = parseInt(value, 10);
        const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
        const newValue = { ...currentDuration, [type]: numericValue };
        const processedNewValue = dateUtils.durationToSeconds(newValue);
        setValue(cooldownDurationFieldName, processedNewValue, { shouldValidate: false });
    };

    const handleInputBlur = () => {
        trigger(cooldownDurationFieldName);
    };

    return (
        <div className="flex w-full flex-col gap-10">
            <RadioGroup onValueChange={onIntervalTypeChange} {...intervalTypeField}>
                <RadioCard
                    label={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.continuous.label')}
                    description={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.continuous.description')}
                    value={PolicyDispatchIntervalType.CONTINUOUS}
                />
                <RadioCard
                    label={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.label')}
                    description={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.description')}
                    value={PolicyDispatchIntervalType.COOLDOWN}
                />
            </RadioGroup>

            {selectedIntervalType === PolicyDispatchIntervalType.COOLDOWN && (
                <Card
                    className={classNames('shadow-neutral-sm flex flex-col gap-6 p-6', {
                        'border-critical-200 border': cooldownDurationField.alert != null,
                    })}
                >
                    <div className="flex flex-col gap-4 md:flex-row">
                        <InputNumber
                            label={t('app.shared.advancedDateInput.duration.hours')}
                            min={0}
                            max={23}
                            className="w-full md:w-1/3"
                            value={currentDuration.hours.toString()}
                            onChange={handleDurationChange('hours')}
                            onBlur={handleInputBlur}
                        />
                        <InputNumber
                            label={t('app.shared.advancedDateInput.duration.days')}
                            min={0}
                            className="w-full md:w-1/3"
                            value={currentDuration.days.toString()}
                            onChange={handleDurationChange('days')}
                            onBlur={handleInputBlur}
                        />
                        <InputNumber
                            label={t('app.shared.advancedDateInput.duration.weeks')}
                            min={0}
                            className="w-full md:w-1/3"
                            value={Math.floor(currentDuration.days / 7).toString()}
                            onChange={(value) => {
                                const parsedValue = parseInt(value, 10);
                                const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
                                const daysFromWeeks = numericValue * 7;
                                const remainingDays = currentDuration.days % 7;
                                handleDurationChange('days')((daysFromWeeks + remainingDays).toString());
                            }}
                            onBlur={handleInputBlur}
                        />
                    </div>
                    {cooldownDurationField.alert && (
                        <p className="text-critical-800 text-sm">{cooldownDurationField.alert.message}</p>
                    )}
                </Card>
            )}
        </div>
    );
};
