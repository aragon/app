export interface IBuildClaimTransactionParams {
    /**
     * The ID of the campaign to claim.
     */
    campaignId: number;
    /**
     * The address of the recipient.
     */
    recipient: string;
    /**
     * The address of the plugin to use for the claim.
     */
    pluginAddress: string;
    /**
     * Additional data for the transaction.
     */
    auxData?: string;
}
