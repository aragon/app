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
    const { formPrefix } = props;

    const { t } = useTranslations();

    const fieldName = `${formPrefix}.supportThreshold`;
    const value = useWatch<Record<string, ITokenSetupGovernanceForm['supportThreshold']>>({
        name: fieldName,
        defaultValue: 0,
    });

    const context = value >= 50 ? 'majority' : 'minority';

    const alert = {
        message: t(`app.plugins.token.tokenSetupGovernance.supportThreshold.alert.${context}`),
        variant: context === 'majority' ? 'success' : 'warning',
    } as const;

    return (
        <NumberProgressInput
            fieldName={fieldName}
            label={t('app.plugins.token.tokenSetupGovernance.supportThreshold.label')}
            helpText={t('app.plugins.token.tokenSetupGovernance.supportThreshold.helpText')}
            valueLabel={`> ${value.toString()} %`}
            total={100}
            prefix=">"
            suffix="%"
            alert={alert}
            tags={[
                { label: t('app.plugins.token.tokenSetupGovernance.supportThreshold.tag.yes'), variant: 'primary' },
                { label: t('app.plugins.token.tokenSetupGovernance.supportThreshold.tag.no'), variant: 'neutral' },
            ]}
        />
    );
};
