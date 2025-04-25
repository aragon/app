import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import { type ProposalStatus } from '@aragon/gov-ui-kit';
import { type IMultisigProposal } from '../../types';

class MultisigProposalUtils {
    getProposalStatus = (proposal: IMultisigProposal): ProposalStatus => {
        const { startDate, endDate, executed, actions } = proposal;

        const status = proposalStatusUtils.getProposalStatus({
            isExecuted: executed.status,
            isVetoed: false,
            startDate,
            endDate,
            paramsMet: this.isApprovalReached(proposal),
            hasActions: actions.length > 0,
            executionExpiryDate: endDate,
            canExecuteEarly: this.isApprovalReached(proposal),
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
