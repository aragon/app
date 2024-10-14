import { ProposalStatus } from '@aragon/ods';

class AdminProposalUtils {
    getProposalStatus = () => ProposalStatus.ACTIVE;
}

export const adminProposalUtils = new AdminProposalUtils();
