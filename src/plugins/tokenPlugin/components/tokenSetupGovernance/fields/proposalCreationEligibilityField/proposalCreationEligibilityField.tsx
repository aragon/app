import { Card, InputNumber, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ITokenSetupGovernanceForm, ITokenSetupGovernanceProps } from '../../tokenSetupGovernance.api';

export interface IProposalCreationEligibilityFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    formPrefix: string;
    /**
     * The token linked to the plugin.
     */
    token: ITokenSetupGovernanceProps['membershipSettings']['token'];
}

export const ProposalCreationEligibilityField: React.FC<IProposalCreationEligibilityFieldProps> = (props) => {
    const { token, formPrefix } = props;
    const { symbol } = token;

    const { t } = useTranslations();

    const { value, onChange, ...field } = useFormField<ITokenSetupGovernanceForm, 'minProposerVotingPower'>('minProposerVotingPower', {
        fieldPrefix: formPrefix,
        label: t('app.plugins.token.tokenSetupGovernance.minVotingPower.label'),
    });

    const radioValue = Number(value) > 0 ? 'members' : 'any';

    const handleRadioChange = (value: string) => onChange(value === 'members' ? '1' : '0');

    return (
        <Card className="flex flex-col gap-6 border border-neutral-100 p-6 shadow-neutral-sm">
            <RadioGroup
                className="w-full"
                helpText={t('app.plugins.token.tokenSetupGovernance.eligibleField.helpText')}
                label={t('app.plugins.token.tokenSetupGovernance.eligibleField.label')}
                onValueChange={handleRadioChange}
                value={radioValue}
            >
                <RadioCard
                    description={t('app.plugins.token.tokenSetupGovernance.eligibleField.members.description')}
                    label={t('app.plugins.token.tokenSetupGovernance.eligibleField.members.label')}
                    value="members"
                />
                <RadioCard
                    description={t('app.plugins.token.tokenSetupGovernance.eligibleField.anyWallet.description')}
                    label={t('app.plugins.token.tokenSetupGovernance.eligibleField.anyWallet.label')}
                    value="any"
                />
            </RadioGroup>
            {radioValue === 'members' && (
                <InputNumber
                    {...field}
                    className="w-full"
                    helpText={t('app.plugins.token.tokenSetupGovernance.minVotingPower.helpText')}
                    onChange={onChange}
                    placeholder={`≥ 1 ${symbol}`}
                    prefix="≥"
                    suffix={symbol}
                    value={value}
                />
            )}
        </Card>
    );
};
