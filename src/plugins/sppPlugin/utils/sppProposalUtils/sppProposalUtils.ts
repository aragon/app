import { ProposalStatus } from '@aragon/ods';

class SppProposalUtils {
    getProposalStatus = (): ProposalStatus => {
        return ProposalStatus.ACTIVE;
    };
}

export const sppProposalUtils = new SppProposalUtils();
