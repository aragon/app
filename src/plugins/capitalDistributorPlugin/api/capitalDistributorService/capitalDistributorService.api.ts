import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestQueryParams } from '@/shared/api/httpService';
import type { CampaignStatus } from './domain';

export interface IGetCampaignListQueryParams extends IPaginatedRequest {
    /**
     * Address of the plugin to fetch the campaigns for.
     */
    pluginAddress: string;
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

export interface IGetCampaignStatsQueryParams {
    /**
     * Address of the plugin to fetch the campaigns stats for.
     */
    pluginAddress: string;
    /**
     * Network of the plugin to fetch the campaigns stats for.
     */
    network: Network;
    /**
     * Address of the user to fetch the stats for.
     */
    userAddress: string;
}

export interface IGetCampaignStatsParams extends IRequestQueryParams<IGetCampaignStatsQueryParams> {}
