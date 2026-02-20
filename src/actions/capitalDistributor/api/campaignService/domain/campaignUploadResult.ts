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
     * ID of the draft campaign created.
     */
    campaignId: string;
}
