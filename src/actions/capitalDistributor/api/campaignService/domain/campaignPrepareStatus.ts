export interface ICampaignPrepareStatus {
    /**
     * ID of the draft campaign.
     */
    campaignId: string;
    /**
     * Merkle root of the campaign rewards, or null if not yet generated.
     */
    merkleRoot: string | null;
    /**
     * Total number of reward recipients in the campaign.
     */
    totalMembers: number;
}
