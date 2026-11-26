import type { Network } from '@/shared/api/daoService';

/**
 * The stored record of a name only: warnings are not stored, the kit derives them from the name when it resolves it
 * (`checkLabel`).
 */
export interface IWorkspaceAlias {
    /**
     * Address that is named, in checksum format.
     */
    address: string;
    /**
     * Name of the address. Untrusted text: checked every time the address book is built.
     */
    name: string;
    /**
     * Network the name is saved for, or null for all networks.
     */
    network: Network | null;
    /**
     * Time of the last change, in milliseconds since the epoch. Decides which name wins among other workspaces.
     */
    updatedAt: number;
}
