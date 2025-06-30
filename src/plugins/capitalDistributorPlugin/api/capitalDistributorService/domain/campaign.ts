import type { IToken } from '@/modules/finance/api/financeService';
import type { IResource } from '@/shared/api/daoService';
import type { CampaignStatus } from './enum';

export interface ICampaign {
    /**
     * Unique identifier for the campaign.
     */
    id: number;
    /**
     * Title of the campaign.
     */
    title: string;
    /**
     * Description of the campaign.
     */
    description: string;
    /**
     * Type of the campaign.
     */
    type: string;
    /**
     * Logo associated with the campaign.
     */
    logo?: string;
    /**
     * Resources associated with the campaign.
     */
    resources?: IResource[];
    /**
     * Status of the campaign (claimed/claimable).
     */
    status: CampaignStatus;
    /**
     * The token associated with the campaign.
     */
    token: IToken;
    /**
     * The amount of tokens the user has claimed or is eligible to claim.
     */
    amount: string;
    /**
     * The start time of the campaign (can be 0 meaning no time restriction).
     */
    startTime: number;
    /**
     * The end time of the campaign (can be 0 meaning no time restriction).
     */
    endTime: number;
    /**
     * Flag indicating whether the campaign is active.
     */
    active: boolean;
    /**
     * The tx hash of the claim transaction. Only present if the campaign has been claimed.
     */
    txHash?: string;
    /**
     * The block timestamp of when the campaign was claimed.  Only present if the campaign has been claimed.
     */
    claimTimestamp?: number;
}
