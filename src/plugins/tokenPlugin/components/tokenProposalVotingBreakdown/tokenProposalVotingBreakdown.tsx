import { useProposal } from '@/modules/governance/api/governanceService';
import { ProposalVoting } from '@aragon/ods';
import { formatUnits } from 'viem';
import type { ITokenProposal } from '../../types';
import { VoteOption } from '../../types/enum/voteOption';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

export interface ITokenProposalVotingBreakdownProps {
    /**
     * Proposal ID to display the proposal breakdown for.
     */
    proposalId: string;
}

const getOptionVotingPower = (proposal: ITokenProposal, option: VoteOption) => {
    const votes = proposal.metrics.votesByOption.find((vote) => vote.type === option);
    const parsedVotingPower = formatUnits(BigInt(votes?.totalVotingPower ?? 0), proposal.settings.token.decimals);

    return parsedVotingPower;
};

export const TokenProposalVotingBreakdown: React.FC<ITokenProposalVotingBreakdownProps> = (props) => {
    const { proposalId } = props;

    const proposalUrlParams = { id: proposalId };
    const proposalParams = { urlParams: proposalUrlParams };
    const { data: proposal } = useProposal<ITokenProposal>(proposalParams);

    if (proposal == null) {
        return null;
    }

    const { symbol, totalSupply, decimals } = proposal.settings.token;
    const { minParticipation, supportThreshold } = proposal.settings;

    const yesVotes = getOptionVotingPower(proposal, VoteOption.YES);
    const noVotes = getOptionVotingPower(proposal, VoteOption.NO);
    const abstainVotes = getOptionVotingPower(proposal, VoteOption.ABSTAIN);

    return (
        <ProposalVoting.BreakdownToken
            totalYes={yesVotes}
            totalNo={noVotes}
            totalAbstain={abstainVotes}
            minParticipation={tokenSettingsUtils.parsePercentageSetting(minParticipation)}
            supportThreshold={tokenSettingsUtils.parsePercentageSetting(supportThreshold)}
            tokenSymbol={symbol}
            tokenTotalSupply={formatUnits(BigInt(totalSupply), decimals)}
        />
    );
};
