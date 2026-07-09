import type { IProposalAction } from '../api/governanceService';

export interface INormalizeActionsParams {
    /**
     * Proposal actions to be normalized.
     */
    actions: IProposalAction[];
    /**
     * ID of the DAO related to the proposal.
     */
    daoId: string;
}
