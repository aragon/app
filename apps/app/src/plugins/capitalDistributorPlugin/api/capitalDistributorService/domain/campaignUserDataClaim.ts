export interface ICampaignUserDataClaim {
    /**
     * The tx hash of the claim transaction.
     */
    transactionHash?: string;
    /**
     * The block timestamp of when the campaign was claimed.
     */
    blockTimestamp?: number;
}
