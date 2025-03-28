import type { ICreateProcessFormProposalCreationBody } from '@/modules/createDao/components/createProcessForm/createProcessFormDefinitions';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputNumber } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { ITokenSetupGovernanceForm } from '../tokenSetupGovernance';
import type { ITokenSetupMembershipForm, ITokenSetupMembershipMember } from '../tokenSetupMembership';

export interface ITokenProposalCreationRequirementsProps {
    /**
     * The body of the process.
     */
    body: ISetupBodyForm<ITokenSetupGovernanceForm, ITokenSetupMembershipMember, ITokenSetupMembershipForm>;
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
}

export const TokenProposalCreationRequirements: React.FC<ITokenProposalCreationRequirementsProps> = (props) => {
    const { fieldPrefix, body } = props;

    const { t } = useTranslations();

    const { totalSupply, decimals } = body.membership.token;
    const parsedTotalSupply = formatUnits(BigInt(totalSupply), decimals);

    const minVotingPowerField = useFormField<ICreateProcessFormProposalCreationBody, 'minVotingPower'>(
        'minVotingPower',
        {
            fieldPrefix,
            defaultValue: '1',
            rules: { validate: (value) => Number(value) > 0 },
            label: t('app.plugins.token.tokenProposalCreationRequirements.label'),
        },
    );

    return (
        <button className="w-full text-left" onClick={(e) => e.preventDefault()}>
            <InputNumber
                prefix="≥"
                helpText={t('app.plugins.token.tokenProposalCreationRequirements.helpText')}
                placeholder={t('app.plugins.token.tokenProposalCreationRequirements.placeholder')}
                max={Number(parsedTotalSupply)}
                {...minVotingPowerField}
            />
        </button>
    );
};
