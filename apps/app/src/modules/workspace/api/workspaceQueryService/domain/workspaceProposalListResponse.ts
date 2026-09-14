import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IWorkspaceProposal } from './workspaceProposal';

/**
 * Indexed proposals of a workspace.
 *
 * The endpoint also returns a `pending` block of queued Safe transactions and the usual `coverage` / `partial`
 * report, neither of which is modelled here: this page only reads DAO accounts, and for those the backend hardcodes
 * the coverage status to available. Every entry that can report a problem describes a Safe queue, which is exactly
 * the data `pending` holds and which this page does not show — surfacing it would warn about data that is not
 * displayed. `metadata.totalRecords` counts `data` only, so pagination stays correct without them.
 */
export interface IWorkspaceProposalListResponse
    extends IPaginatedResponse<IWorkspaceProposal> {}
