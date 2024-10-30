import { ProposalVoting } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { IMultisigProposal } from '../../types';

export interface IMultisigProposalVotingBreakdownProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: IMultisigProposal;
    /**
     * Vote or advance component to render.
     */
    voteOrAdvanceComponent?: ReactNode;
}

export const MultisigProposalVotingBreakdown: React.FC<IMultisigProposalVotingBreakdownProps> = (props) => {
    const { proposal, voteOrAdvanceComponent } = props;

    return (
        <ProposalVoting.BreakdownMultisig
            approvalsAmount={proposal.metrics.totalVotes}
            minApprovals={proposal.settings.minApprovals}
        >
            {voteOrAdvanceComponent}
        </ProposalVoting.BreakdownMultisig>
    );
};
