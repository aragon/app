import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import { type ProposalStatus } from '@aragon/gov-ui-kit';
import { type IMultisigProposal } from '../../types';

class MultisigProposalUtils {
    getProposalStatus = (proposal: IMultisigProposal): ProposalStatus => {
        const isExecuted = proposal.executed.status;
        const isVetoed = false;
        const startDate = proposal.startDate;
        const endDate = proposal.endDate;
        const paramsMet = this.isApprovalReached(proposal);
        const hasActions = proposal.actions.length > 0;
        const canExecuteEarly = paramsMet;

        const status = proposalStatusUtils.getProposalStatus({
            isExecuted,
            isVetoed,
            startDate,
            endDate,
            paramsMet,
            hasActions,
            executionExpiryDate: endDate,
            canExecuteEarly,
        });

        return status;

        // const now = DateTime.utc();

        // const startDate = DateTime.fromMillis(proposal.startDate * 1000).toUTC();
        // const endDate = DateTime.fromMillis(proposal.endDate * 1000).toUTC();

        // const approvalReached = this.isApprovalReached(proposal);
        // const isSignalingProposal = proposal.actions.length === 0;

        // const isExecutable = approvalReached && now <= endDate && !isSignalingProposal;

        // if (proposal.executed.status) {
        //     return ProposalStatus.EXECUTED;
        // }

        // if (startDate >= now) {
        //     return ProposalStatus.PENDING;
        // }

        // if (isExecutable) {
        //     return ProposalStatus.EXECUTABLE;
        // }

        // if (now <= endDate) {
        //     return ProposalStatus.ACTIVE;
        // }

        // if (approvalReached) {
        //     return isSignalingProposal ? ProposalStatus.ACCEPTED : ProposalStatus.EXPIRED;
        // }

        // return ProposalStatus.REJECTED;
    };

    isApprovalReached = (proposal: IMultisigProposal): boolean => {
        const { metrics, settings } = proposal;
        const approvalReached = metrics.totalVotes >= settings.minApprovals;

        return approvalReached;
    };
}

export const multisigProposalUtils = new MultisigProposalUtils();
