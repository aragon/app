'use client';

import { ProposalVoting } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { IMultisigProposal } from '../../types';

export interface IMultisigProposalVotingBreakdownProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: IMultisigProposal;
    /**
     * Defines if the voting is to veto or not.
     */
    isVeto?: boolean;
    /**
     * Additional children to render.
     */
    children?: ReactNode;
}

export const MultisigProposalVotingBreakdown: React.FC<IMultisigProposalVotingBreakdownProps> = (props) => {
    const { proposal, isVeto, children } = props;

    return (
        <ProposalVoting.BreakdownMultisig
            approvalsAmount={proposal.metrics.totalVotes}
            isVeto={isVeto}
            membersCount={Number(proposal.settings.historicalMembersCount)}
            minApprovals={proposal.settings.minApprovals}
        >
            {children}
        </ProposalVoting.BreakdownMultisig>
    );
};
