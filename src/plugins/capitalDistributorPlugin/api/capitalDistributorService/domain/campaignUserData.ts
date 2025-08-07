import type { CampaignStatus } from './enum';

export interface ICampaignUserData {
    /**
     * Status of the campaign (claimed/claimable).
     */
    status: CampaignStatus;
    /**
     * The amount of tokens the user has claimed or is eligible to claim.
     */
    amount: string;
    /**
     * The tx hash of the claim transaction. Only present if the campaign has been claimed.
     */
    txHash?: string;
    /**
     * The block timestamp of when the campaign was claimed. Only present if the campaign has been claimed.
     */
    txTimestamp?: number;
}
