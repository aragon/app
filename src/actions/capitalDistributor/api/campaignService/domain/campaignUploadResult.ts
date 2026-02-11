export interface ICampaignUploadResult {
    /**
     * Whether the upload was successful.
     */
    success: boolean;
    /**
     * Summary message of the upload result.
     */
    message: string;
    /**
     * Number of new members inserted.
     */
    totalInserted: number;
    /**
     * Number of existing members updated.
     */
    totalUpdated: number;
    /**
     * Number of members deleted.
     */
    totalDeleted: number;
    /**
     * Total number of members processed.
     */
    totalProcessed: number;
    /**
     * ID of the draft campaign created.
     */
    campaignId: string;
}
