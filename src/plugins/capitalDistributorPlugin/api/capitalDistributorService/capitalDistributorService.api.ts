import type { IRequestQueryParams, IRequestUrlParams } from '@/shared/api/httpService';

export interface IGetCampaignsListQueryParams {
    /**
     * Address of the member to fetch the campaigns from.
     */
    memberAddress: string;
    /**
     * Status of the campaign (claimed/claimable).
     */
    status?: 'claimed' | 'claimable';
}

export interface IGetCampaignsListParams extends IRequestQueryParams<IGetCampaignsListQueryParams> {}

export interface IGetCampaignStatsUrlParams {
    /**
     * Address of the member to fetch the stats for.
     */
    memberAddress: string;
}

export interface IGetCampaignStatsParams extends IRequestUrlParams<IGetCampaignStatsUrlParams> {}
