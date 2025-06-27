import type { IRequestQueryParams, IRequestUrlParams } from '@/shared/api/httpService';
import type { CampaignStatus } from './domain';

export interface IGetCampaignsListQueryParams {
    /**
     * Address of the member to fetch the campaigns from.
     */
    memberAddress: string;
    /**
     * Status of the campaign (claimed/claimable).
     */
    status?: CampaignStatus;
}

export interface IGetCampaignsListParams extends IRequestQueryParams<IGetCampaignsListQueryParams> {}

export interface IGetCampaignStatsUrlParams {
    /**
     * Address of the member to fetch the stats for.
     */
    memberAddress: string;
}

export interface IGetCampaignStatsParams extends IRequestUrlParams<IGetCampaignStatsUrlParams> {}
