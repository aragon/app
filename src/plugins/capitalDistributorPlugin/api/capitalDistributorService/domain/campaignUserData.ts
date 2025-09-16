import type { ICampaignUserDataClaim } from './campaignUserDataClaim';
import type { CampaignStatus } from './enum';

export interface ICampaignUserData {
    /**
     * Status of the campaign (claimed/claimable).
     */
    status: CampaignStatus;
    /**
     * The amount of tokens the user is eligible to claim.
     */
    totalAmount: string;
    /**
     * The amount of tokens the user has claimed.
     */
    totalClaimed: string;
    /**
     * Information about the user claim transactions.
     */
    claims: ICampaignUserDataClaim[];
}
