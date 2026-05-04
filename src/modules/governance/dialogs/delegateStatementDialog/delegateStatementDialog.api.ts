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
     * Existing IPFS CID of the persisted statement, when one already exists. The dialog
     * pre-loads its content into the form and switches the affordance from create to edit.
     */
    existingCid?: string | null;
}
