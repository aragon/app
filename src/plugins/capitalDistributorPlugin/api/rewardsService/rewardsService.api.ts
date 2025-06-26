import type { IRequestQueryParams, IRequestUrlParams } from '@/shared/api/httpService';

export interface IGetCampaignsQueryParams {
    /**
     * Address of the member to fetch the campaigns from.
     */
    memberAddress: string;
}

export interface IGetCampaignsParams extends IRequestQueryParams<IGetCampaignsQueryParams> {}

export interface IGetCampaignStatsUrlParams {
    /**
     * Address of the member to fetch the stats for.
     */
    memberAddress: string;
}

export interface IGetCampaignStatsParams extends IRequestUrlParams<IGetCampaignStatsUrlParams> {}
