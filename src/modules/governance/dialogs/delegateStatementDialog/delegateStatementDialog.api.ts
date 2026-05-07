import type { Network } from '@/shared/api/daoService';

export interface IDelegateStatementDialogParams {
    /**
     * Address of the governance token whose delegate statement is being edited.
     */
    tokenAddress: string;
    /**
     * Profile address whose statement is being edited (always the connected wallet —
     * the card only opens this dialog when the connected wallet matches the profile).
     */
    memberAddress: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Primary ENS name of the connected wallet. Required because the card only opens
     * this dialog when an ENS name is resolved; passing it down avoids a duplicate
     * lookup and keeps both dialogs working off the same identity.
     */
    ensName: string;
    /**
     * Network of the governance token. Drives the EIP-3770 prefix in the ENS key.
     */
    network: Network;
    /**
     * Existing IPFS CID of the persisted statement, when one already exists. The dialog
     * pre-loads its content into the form and switches the affordance from create to edit.
     */
    existingCid?: string | null;
}
