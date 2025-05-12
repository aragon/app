import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import { type ProposalStatus } from '@aragon/gov-ui-kit';
import { type IMultisigProposal } from '../../types';

class MultisigProposalUtils {
    getProposalStatus = (proposal: IMultisigProposal): ProposalStatus => {
        const { startDate, endDate, executed, hasActions } = proposal;

        const paramsMet = this.isApprovalReached(proposal);

        const status = proposalStatusUtils.getProposalStatus({
            isExecuted: executed.status,
            isVetoed: false,
            startDate,
            endDate,
            paramsMet,
            hasActions,
            executionExpiryDate: endDate,
            canExecuteEarly: true,
        });

        return status;
    };

    isApprovalReached = (proposal: IMultisigProposal): boolean => {
        const { metrics, settings } = proposal;
        const approvalReached = metrics.totalVotes >= settings.minApprovals;

        return approvalReached;
    };
}

export const multisigProposalUtils = new MultisigProposalUtils();
