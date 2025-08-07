import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestQueryParams, IRequestUrlParams } from '@/shared/api/httpService';
import type { CampaignStatus } from './domain';

export interface IGetCampaignListQueryParams extends IPaginatedRequest {
    /**
     * Address of the plugin to fetch the campaigns for.
     */
    plugin: string;
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * Address of the user to retrieve the user-specific data for the campaigns.
     */
    userAddress: string;
    /**
     * Status of the campaigns to be fetched (claimed/claimable).
     */
    status?: CampaignStatus;
}

export interface IGetCampaignListParams extends IRequestQueryParams<IGetCampaignListQueryParams> {}

export interface IGetCampaignStatsUrlParams {
    /**
     * Address of the user to fetch the campaign stats for.
     */
    userAddress: string;
}

export interface IGetCampaignStatsParams extends IRequestUrlParams<IGetCampaignStatsUrlParams> {}
