import { useProposal } from '@/modules/governance/api/governanceService';
import { ProposalVoting } from '@aragon/ods';
import { formatUnits } from 'viem';
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

    const { decimals, symbol, totalSupply } = proposal.token;
    const { minParticipation, supportThreshold } = proposal.settings;

    const yesVotes = proposal.metrics.votesByOption.find((vote) => vote.type === VoteOption.YES);
    const parsedYesVotes = formatUnits(BigInt(yesVotes?.totalVotingPower ?? '0'), decimals);

    const noVotes = proposal.metrics.votesByOption.find((vote) => vote.type === VoteOption.NO);
    const parsedNoVotes = formatUnits(BigInt(noVotes?.totalVotingPower ?? '0'), decimals);

    const abstainVotes = proposal.metrics.votesByOption.find((vote) => vote.type === VoteOption.ABSTAIN);
    const parsedAbstainVotes = formatUnits(BigInt(abstainVotes?.totalVotingPower ?? '0'), decimals);

    return (
        <ProposalVoting.BreakdownToken
            totalYes={parsedYesVotes}
            totalNo={parsedNoVotes}
            totalAbstain={parsedAbstainVotes}
            minParticipation={minParticipation}
            supportThreshold={supportThreshold}
            tokenSymbol={symbol}
            tokenTotalSupply={totalSupply}
        />
    );
};
