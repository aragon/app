import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { type IMultisigProposal } from '../../types';

class MultisigProposalUtils {
    getProposalStatus = (proposal: IMultisigProposal): ProposalStatus => {
        const now = DateTime.utc();

        const startDate = DateTime.fromMillis(proposal.startDate * 1000).toUTC();
        const endDate = DateTime.fromMillis(proposal.endDate! * 1000).toUTC();

        const approvalReached = this.isApprovalReached(proposal);
        const isSignalingProposal = proposal.actions.length === 0;

        const isExecutable = approvalReached && now <= endDate && !isSignalingProposal;

        if (proposal.executed.status) {
            return ProposalStatus.EXECUTED;
        }

        if (startDate >= now) {
            return ProposalStatus.PENDING;
        }

        if (isExecutable) {
            return ProposalStatus.EXECUTABLE;
        }

        if (now <= endDate) {
            return ProposalStatus.ACTIVE;
        }

        if (approvalReached) {
            return isSignalingProposal ? ProposalStatus.ACCEPTED : ProposalStatus.EXPIRED;
        }

        return ProposalStatus.REJECTED;
    };

    isApprovalReached = (proposal: IMultisigProposal): boolean => {
        const { metrics, settings } = proposal;
        const approvalReached = metrics.totalVotes >= settings.minApprovals;

        return approvalReached;
    };
}

export const multisigProposalUtils = new MultisigProposalUtils();
