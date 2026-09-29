import type { IWorkspacePageParams } from './workspacePageParams';

export interface IWorkspaceProposalPageParams extends IWorkspacePageParams {
    /**
     * ID of the workspace account the proposal belongs to, in the `{network}-{address}` format. It doubles as the
     * DAO ID, which is what gives the proposal slug its context — a slug is only unique within one DAO.
     */
    accountId: string;
    /**
     * Slug of the proposal.
     */
    proposalSlug: string;
}
