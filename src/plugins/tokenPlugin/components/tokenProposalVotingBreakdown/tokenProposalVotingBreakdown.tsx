import { useProposal } from '@/modules/governance/api/governanceService';
import { ProposalVoting } from '@aragon/ods';
import type { ITokenProposal } from '../../types';
import { VoteOption } from '../../types/enum/voteOption';

export interface ITokenProposalVotingBreakdownProps {
    /**
     * Proposal ID to display the proposal breakdown for.
     */
    proposalId: string;
}

export const TokenProposalVotingBreakdown: React.FC<ITokenProposalVotingBreakdownProps> = (props) => {
    const { proposalId } = props;

    const proposalUrlParams = { id: proposalId };
    const proposalParams = { urlParams: proposalUrlParams };
    const { data: proposal } = useProposal<ITokenProposal>(proposalParams);

    if (proposal == null) {
        return null;
    }

    const yesVotes = proposal.metrics.votesByOption.find((vote) => vote.type === VoteOption.YES);
    const noVotes = proposal.metrics.votesByOption.find((vote) => vote.type === VoteOption.NO);
    const abstainVotes = proposal.metrics.votesByOption.find((vote) => vote.type === VoteOption.ABSTAIN);

    return (
        <ProposalVoting.BreakdownToken
            totalYes={yesVotes?.totalVotingPower ?? '0'}
            totalNo={noVotes?.totalVotingPower ?? '0'}
            totalAbstain={abstainVotes?.totalVotingPower ?? '0'}
            minParticipation={proposal.settings.minParticipation}
            supportThreshold={proposal.settings.supportThreshold}
            tokenSymbol={proposal.token.symbol}
            tokenTotalSupply={proposal.token.totalSupply}
        />
    );
};
