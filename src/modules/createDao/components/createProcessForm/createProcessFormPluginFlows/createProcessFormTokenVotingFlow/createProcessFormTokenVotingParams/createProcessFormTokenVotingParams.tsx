import { TokenSetupGovernance } from '@/plugins/tokenPlugin/components/tokenSetupGovernance';
import { useWatch } from 'react-hook-form';
import { parseUnits } from 'viem';
import { type ITokenVotingMember } from '../../../../../components/createProcessForm/createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormTokenVotingParamsProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormTokenVotingParams: React.FC<ICreateProcessFormTokenVotingParamsProps> = (props) => {
    const { fieldPrefix } = props;

    const members =
        useWatch<Record<string, ITokenVotingMember[] | undefined>>({ name: `${fieldPrefix}.members` }) ?? [];
    const tokenSymbol = useWatch<Record<string, string>>({ name: `${fieldPrefix}.tokenSymbol` });

    const totalSupply = members.reduce((current, member) => current + Number(member.tokenAmount), 0).toString();
    const parsedTotalSupply = parseUnits(totalSupply, 18).toString();
    const token = { symbol: tokenSymbol, totalSupply: parsedTotalSupply, decimals: 18 };

    return (
        <TokenSetupGovernance
            formPrefix={fieldPrefix}
            token={token}
            isSubPlugin={true}
            showProposalCreationSettings={false}
        />
    );
};
