import { type IDaoPageParams } from '@/shared/types';

export interface IDaoProposalPageParams extends IDaoPageParams {
    /**
     * ID of the proposal.
     */
    proposalId: string;
}
