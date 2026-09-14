import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IResource } from '@/shared/api/daoService/domain/resource';

/**
 * Metadata of the DAO a workspace proposal belongs to, embedded on every row by the backend.
 *
 * This is deliberately not an `IDao`: the backend projection only carries the display fields and has no `plugins`,
 * therefore it cannot resolve a proposal slug or URL. Use it to label a row, and read the full DAO through
 * `useDao` when a link is needed.
 */
export interface IWorkspaceProposalDao {
    /**
     * Address of the DAO.
     */
    address: string;
    /**
     * Name of the DAO.
     */
    name: string;
    /**
     * Description of the DAO.
     */
    description: string;
    /**
     * Avatar of the DAO, or null when it has none.
     */
    avatar: string | null;
    /**
     * Links published by the DAO.
     */
    links: IResource[];
}

/**
 * Indexed proposal as returned by the workspace proposals endpoint: a standard proposal row extended with the
 * metadata of the DAO it belongs to, which the single DAO endpoints do not need.
 */
export interface IWorkspaceProposal extends IProposal {
    /**
     * DAO the proposal belongs to. The backend wraps it in a single-element array.
     */
    dao: IWorkspaceProposalDao[];
}
