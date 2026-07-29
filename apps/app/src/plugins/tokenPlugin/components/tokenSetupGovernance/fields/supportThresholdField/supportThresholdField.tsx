import { useWatch } from 'react-hook-form';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
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

const defaultSupportThreshold = 50;

export const SupportThresholdField: React.FC<ISupportThresholdFieldProps> = (
    props,
) => {
    const { formPrefix } = props;

    const { t } = useTranslations();

    const fieldName = `${formPrefix}.supportThreshold`;
    const value = useWatch<
        Record<string, ITokenSetupGovernanceForm['supportThreshold']>
    >({
        name: fieldName,
        defaultValue: defaultSupportThreshold,
    });

    const context = value >= 50 ? 'majority' : 'minority';

    const alert = {
        message: t(
            `app.plugins.token.tokenSetupGovernance.supportThreshold.alert.${context}`,
        ),
        variant: context === 'majority' ? 'success' : 'warning',
    } as const;

    return (
        <NumberProgressInput
            alert={alert}
            defaultValue={defaultSupportThreshold}
            fieldName={fieldName}
            helpText={t(
                'app.plugins.token.tokenSetupGovernance.supportThreshold.helpText',
            )}
            label={t(
                'app.plugins.token.tokenSetupGovernance.supportThreshold.label',
            )}
            min={1}
            prefix=">"
            suffix="%"
            tags={[
                {
                    label: t(
                        'app.plugins.token.tokenSetupGovernance.supportThreshold.tag.yes',
                    ),
                    variant: 'primary',
                },
                {
                    label: t(
                        'app.plugins.token.tokenSetupGovernance.supportThreshold.tag.no',
                    ),
                    variant: 'neutral',
                },
            ]}
            total={99}
            valueLabel={`> ${value.toString()} %`}
        />
    );
};
