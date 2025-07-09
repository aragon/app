import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { IRequestQueryParams, IRequestUrlParams } from '@/shared/api/httpService';
import type { CampaignStatus } from './domain';

export interface IGetCampaignListQueryParams extends IPaginatedRequest {
    /**
     * Address of the member to fetch the campaigns for.
     */
    memberAddress: string;
    /**
     * Status of the campaign (claimed/claimable).
     */
    status?: CampaignStatus;
}

export interface IGetCampaignListParams extends IRequestQueryParams<IGetCampaignListQueryParams> {}

export interface IGetCampaignStatsUrlParams {
    /**
     * Address of the member to fetch the campaign stats for.
     */
    memberAddress: string;
}

export interface IGetCampaignStatsParams extends IRequestUrlParams<IGetCampaignStatsUrlParams> {}
