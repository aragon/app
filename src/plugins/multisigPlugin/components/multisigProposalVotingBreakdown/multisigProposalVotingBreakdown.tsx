import { useProposal } from '@/modules/governance/api/governanceService';
import { ProposalVoting } from '@aragon/ods';
import type { IMultisigProposal } from '../../types';

export interface IMultisigProposalVotingBreakdownProps {
    /**
     * Proposal ID to display the proposal breakdown for.
     */
    proposalId: string;
}

export const MultisigProposalVotingBreakdown: React.FC<IMultisigProposalVotingBreakdownProps> = (props) => {
    const { proposalId } = props;

    const proposalUrlParams = { id: proposalId };
    const proposalParams = { urlParams: proposalUrlParams };
    const { data: proposal } = useProposal<IMultisigProposal>(proposalParams);

    if (proposal == null) {
        return null;
    }

    return (
        <ProposalVoting.BreakdownMultisig
            approvalsAmount={proposal.metrics.totalVotes}
            minApprovals={proposal.settings.minApprovals}
        />
    );
};
