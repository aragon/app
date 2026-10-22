import type { IWorkspaceAccountPageParams } from './workspaceAccountPageParams';

export interface IWorkspaceAccountProposalPageParams
    extends IWorkspaceAccountPageParams {
    /**
     * Slug of the proposal on the account, e.g. `MUL-4`.
     */
    proposalSlug: string;
}
