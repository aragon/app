import { type ProposalStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { type IMultisigProposal } from '../../types';

class MultisigProposalUtils {
    getProposalStatus = (proposal: IMultisigProposal): ProposalStatus => {
        const now = DateTime.utc();

        const startDate = DateTime.fromMillis(proposal.startDate * 1000).toUTC();
        const endDate = DateTime.fromMillis(proposal.endDate * 1000).toUTC();

        const approvalReached = this.isApprovalReached(proposal);
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

        if (approvalReached) {
            return isSignalingProposal ? 'accepted' : 'expired';
        }

        return 'rejected';
    };

    isApprovalReached = (proposal: IMultisigProposal): boolean => {
        const { metrics, settings } = proposal;
        const approvalReached = metrics.totalVotes >= settings.minApprovals;

        return approvalReached;
    };
}

export const multisigProposalUtils = new MultisigProposalUtils();
