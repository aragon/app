import { type IDaoPageParams } from '@/shared/types';

export interface IDaoProposalPageParams extends IDaoPageParams {
    /**
     * Slug of the proposal.
     */
    proposalSlug: string;
}
