import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IGetCampaignsListParams, IGetCampaignStatsParams } from './capitalDistributorService.api';
import type { ICampaign, ICapitalDistributorStats } from './domain';
import { mockCampaigns, mockCampaignsStats } from './mock_campaigns';

class CapitalDistributorService extends AragonBackendService {
    private urls = {
        campaigns: '/v1/campaigns',
        stats: '/v1/stats/:address',
    };

    getCampaignsList = async (params: IGetCampaignsListParams): Promise<ICampaign[]> => {
        // const result = await this.request<ICampaign[]>(this.urls.campaigns, params);

        // return result;

        // TODO: Remove this mock data and use the actual API endpoint when available
        const filtered = params.queryParams.status
            ? mockCampaigns.filter((campaign) => campaign.status === params.queryParams.status)
            : mockCampaigns;

        return Promise.resolve(filtered);
    };

    getCampaignStats = async (params: IGetCampaignStatsParams): Promise<ICapitalDistributorStats> => {
        console.log(params);
        // const result = await this.request<ICapitalDistributorStats>(this.urls.stats, params);

        // return result;

        // TODO: Remove this mock data and use the actual API endpoint when available
        return Promise.resolve(mockCampaignsStats);
    };
}

export const capitalDistributorService = new CapitalDistributorService();
