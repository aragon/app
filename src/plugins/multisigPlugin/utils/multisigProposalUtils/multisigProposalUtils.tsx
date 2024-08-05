import { type ProposalStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { type IMultisigProposal } from '../../types';

class MultisigProposalUtils {
    getProposalStatus = (proposal: IMultisigProposal): ProposalStatus => {
        const now = DateTime.utc();

        const startDate = DateTime.fromMillis(proposal.startDate * 1000);
        const endDate = DateTime.fromMillis(proposal.endDate * 1000);

        const approvalReached = proposal.metrics.totalVotes >= proposal.settings.minApprovals;
        const isSignalingProposal = proposal.actions.length === 0;

        if (proposal.executed.status === true) {
            return 'executed';
        }

        if (startDate >= now) {
            return 'pending';
        }

        if (now <= endDate) {
            return 'active';
        }

        if (approvalReached && isSignalingProposal) {
            return 'accepted';
        }

        return approvalReached ? 'expired' : 'rejected';
    };
}

export const multisigProposalUtils = new MultisigProposalUtils();
