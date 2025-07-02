import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IGetCampaignsListParams, IGetCampaignStatsParams } from './capitalDistributorService.api';
import type { ICampaign, ICapitalDistributorStats } from './domain';

class CapitalDistributorService extends AragonBackendService {
    private urls = {
        campaigns: '/v1/campaigns',
        stats: '/v1/stats/:address',
    };

    getCampaignsList = async ({ queryParams }: IGetCampaignsListParams): Promise<IPaginatedResponse<ICampaign>> => {
        const result = await this.request<IPaginatedResponse<ICampaign>>(this.urls.campaigns, { queryParams });

        return result;
    };

    getCampaignStats = async (params: IGetCampaignStatsParams): Promise<ICapitalDistributorStats> => {
        const result = await this.request<ICapitalDistributorStats>(this.urls.stats, params);

        return result;
    };
}

export const capitalDistributorService = new CapitalDistributorService();
