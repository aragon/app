export interface ISafeConfirmation {
    /**
     * Checksummed address of the owner that confirmed the transaction.
     */
    owner: string;
    /**
     * Signature produced by the owner. Assembling these into an execution payload is out of
     * scope for the read path — never hand-roll the byte layout.
     */
    signature: string;
    /**
     * ISO date the confirmation was submitted.
     */
    submissionDate: string;
}
