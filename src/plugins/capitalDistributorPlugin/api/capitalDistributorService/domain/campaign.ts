import type { IToken } from '@/modules/finance/api/financeService';
import type { IResource } from '@/shared/api/daoService';
import type { ICampaignUserData } from './campaignUserData';

export interface ICampaign<TUserData extends ICampaignUserData = ICampaignUserData, TStrategy = unknown> {
    /**
     * Unique identifier for the campaign.
     */
    campaignId: string;
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
     * The token associated with the campaign.
     */
    token: IToken;
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
     * Flag indicating whether the user can claim multiple times.
     */
    multipleClaimsAllowed: boolean;
    /**
     * Campaign data specific to a user.
     */
    userData: TUserData;
    /**
     * Data specific to the distribution strategy of the campaign.
     */
    strategy: TStrategy;
}
