import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { type ICreatePolicyFormData, PolicyDispatchIntervalType } from '../createPolicyFormDefinitions';

export interface ICreatePolicyFormIntervalProps {}

export const CreatePolicyFormInterval: React.FC<ICreatePolicyFormIntervalProps> = () => {
    const { t } = useTranslations();

    const intervalTypeFieldName = 'dispatchInterval.type';
    const cooldownDurationFieldName = 'dispatchInterval.cooldownDuration';

    const { onChange: onIntervalTypeChange, ...intervalTypeField } = useFormField<ICreatePolicyFormData, typeof intervalTypeFieldName>(
        intervalTypeFieldName,
        {
            defaultValue: PolicyDispatchIntervalType.CONTINUOUS,
        }
    );

    const selectedIntervalType = useWatch({
        name: intervalTypeFieldName,
    }) as PolicyDispatchIntervalType;

    return (
        <div className="flex w-full flex-col gap-10">
            <RadioGroup onValueChange={onIntervalTypeChange} {...intervalTypeField} className="flex gap-4 md:flex-row">
                <RadioCard
                    description={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.continuous.description')}
                    label={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.continuous.label')}
                    value={PolicyDispatchIntervalType.CONTINUOUS}
                />
                <RadioCard
                    description={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.description')}
                    label={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.label')}
                    value={PolicyDispatchIntervalType.COOLDOWN}
                />
            </RadioGroup>

            {selectedIntervalType === PolicyDispatchIntervalType.COOLDOWN && (
                <AdvancedDateInputDuration
                    field={cooldownDurationFieldName}
                    infoDisplay="inline"
                    infoText={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.duration.error')}
                    label={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.duration.label')}
                    minDuration={{ days: 0, hours: 0, minutes: 1 }}
                    useSecondsFormat={true}
                    validateMinDuration={true}
                />
            )}
        </div>
    );
};
