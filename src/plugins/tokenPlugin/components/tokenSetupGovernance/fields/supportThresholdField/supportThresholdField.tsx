import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWatch } from 'react-hook-form';
import type { ITokenSetupGovernanceForm } from '../../tokenSetupGovernance.api';

export interface ISupportThresholdFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    formPrefix: string;
    /**
     * Initial support threshold value.
     */
    initialValue?: number;
}

export const SupportThresholdField: React.FC<ISupportThresholdFieldProps> = (props) => {
    const { formPrefix, initialValue } = props;

    const { t } = useTranslations();

    const fieldName = `${formPrefix}.supportThreshold`;
    const value = useWatch<Record<string, ITokenSetupGovernanceForm['supportThreshold']>>({
        name: fieldName,
        defaultValue: 0,
    });

    const thresholdIndicator = initialValue ? tokenSettingsUtils.ratioToPercentage(initialValue) : undefined;
    const context = value >= 50 ? 'majority' : 'minority';

    return (
        <NumberProgressInput
            fieldName={fieldName}
            label={t('app.plugins.token.tokenSetupGovernance.supportThreshold.label')}
            helpText={t('app.plugins.token.tokenSetupGovernance.supportThreshold.helpText')}
            valueLabel={`> ${value.toString()} %`}
            total={100}
            prefix=">"
            suffix="%"
            alert={{
                message: t(`app.plugins.token.tokenSetupGovernance.supportThreshold.alert.${context}`),
                variant: context === 'majority' ? 'success' : 'warning',
            }}
            thresholdIndicator={thresholdIndicator}
            tags={[
                { label: 'Yes', variant: 'primary' },
                { label: 'No', variant: 'neutral' },
            ]}
        />
    );
};
