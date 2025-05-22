import { ProposalVoting } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { IMultisigProposal } from '../../types';

export interface IMultisigProposalVotingBreakdownProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: IMultisigProposal;
    /**
     * Additional children to render.
     */
    children?: ReactNode;
}

export const MultisigProposalVotingBreakdown: React.FC<IMultisigProposalVotingBreakdownProps> = (props) => {
    const { proposal, children } = props;

    return (
        <ProposalVoting.BreakdownMultisig
            approvalsAmount={proposal.metrics.totalVotes}
            minApprovals={proposal.settings.minApprovals}
            membersCount={Number(proposal.settings.historicalMembersCount)}
        >
            {children}
        </ProposalVoting.BreakdownMultisig>
    );
};
