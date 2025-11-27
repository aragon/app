import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { PolicyDispatchIntervalType } from '../createPolicyFormDefinitions';

export interface ICreatePolicyFormIntervalProps {
    /**
     * Prefix to prepend to all the interval form fields.
     */
    fieldPrefix?: string;
}

export const CreatePolicyFormInterval: React.FC<ICreatePolicyFormIntervalProps> = (props) => {
    const { fieldPrefix } = props;
    const { t } = useTranslations();

    const intervalFieldName = fieldPrefix ? `${fieldPrefix}.dispatchInterval` : 'dispatchInterval';
    const intervalTypeFieldName = `${intervalFieldName}.type` as any;
    const cooldownDurationFieldName = `${intervalFieldName}.cooldownDuration` as any;

    const { onChange: onIntervalTypeChange, ...intervalTypeField } = useFormField<Record<string, any>, any>(
        intervalTypeFieldName,
        {
            defaultValue: PolicyDispatchIntervalType.CONTINUOUS,
        },
    );

    const selectedIntervalType = useWatch({
        name: intervalTypeFieldName,
    }) as PolicyDispatchIntervalType;

    return (
        <div className="flex w-full flex-col gap-10">
            <RadioGroup onValueChange={onIntervalTypeChange} {...intervalTypeField} className="flex gap-4 md:flex-row">
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
                <AdvancedDateInputDuration
                    field={cooldownDurationFieldName}
                    label={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.duration.label')}
                    infoText={t('app.capitalFlow.createPolicyPage.steps.INTERVAL.cooldown.duration.error')}
                    infoDisplay="inline"
                    useSecondsFormat={true}
                    validateMinDuration={true}
                    minDuration={{ days: 0, hours: 0, minutes: 1 }}
                />
            )}
        </div>
    );
};
