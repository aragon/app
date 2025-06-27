import type { IToken } from "@/modules/finance/api/financeService";
import type { IResource } from "@/shared/api/daoService";

export interface ICampaign {
    /**
     * Unique identifier for the campaign.
     */
    id: string;
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
     * Resources associated with the campaign.
     */
    resources?: IResource[];
    /**
     * Status of the campaign (claimed/claimable).
     */
    status: 'claimed' | 'claimable';
    /**
     * The token associated with the campaign.
     */
    token: IToken;
    /**
     * The amount of tokens the user has claimed or is eligible to claim.
     */
    amount: string;
    /**
     * The start time of the campaign.
     */
    startTime: number;
    /**
     * The end time of the campaign.
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
     * The block timestamp of when the campaign was claimed.
     */
    claimTimestamp?: number;
}
