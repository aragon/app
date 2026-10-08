import type { Network } from '@/shared/api/daoService';
import type { WorkspaceMembershipRole } from './enum';
import type { IWorkspaceAccountRef } from './workspaceAccountInfo';

export interface IWorkspaceMembership {
    /**
     * Account the membership belongs to.
     */
    account: IWorkspaceAccountRef;
    /**
     * Governance the member is part of: a plugin of a DAO account, or the Safe itself for a Safe owner.
     */
    governance: {
        /**
         * Address of the governance plugin, or of the Safe.
         */
        address: string;
        /**
         * Interface type of the governance plugin, `safe` for a Safe.
         */
        type: string;
    };
    /**
     * Role of the member on the account.
     */
    role: WorkspaceMembershipRole;
    /**
     * Voting power of the member, set by the governances that have one.
     */
    votingPower?: string;
    /**
     * Token balance of the member, set by the token-based governances.
     */
    tokenBalance?: string;
}

/**
 * Member of one or more accounts of a workspace, as returned by the workspace members endpoint. The same address is
 * merged into a single entry per network, with one membership per account and governance it belongs to.
 */
export interface IWorkspaceMember {
    /**
     * Network of the member.
     */
    network: Network;
    /**
     * Address of the member.
     */
    address: string;
    /**
     * ENS name of the member, when it has one.
     */
    ens?: string | null;
    /**
     * Avatar of the member, when it has one.
     */
    avatar?: string | null;
    /**
     * Accounts and governances the member is part of. Never empty.
     */
    memberships: IWorkspaceMembership[];
}
