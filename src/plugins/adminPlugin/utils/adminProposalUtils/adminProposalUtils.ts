import { ProposalStatus } from '@aragon/ods';

class AdminProposalUtils {
    getProposalStatus = () => ProposalStatus.EXECUTED;
}

export const adminProposalUtils = new AdminProposalUtils();
