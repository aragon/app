import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IGetCampaignsListParams, IGetCampaignStatsParams } from './capitalDistributorService.api';
import type { ICampaign, ICapitalDistributorStats } from './domain';
import { mockCampaigns, mockCampaignsStats } from './mock_campaigns';

class CapitalDistributorService extends AragonBackendService {
    private urls = {
        campaigns: '/v1/campaigns',
        stats: '/v1/stats/:address',
    };

    getCampaignsList = async ({ queryParams }: IGetCampaignsListParams): Promise<IPaginatedResponse<ICampaign>> => {
        // const result = await this.request<IPaginatedResponse<ICampaign>>(this.urls.campaigns, {queryParams});

        // return result;

        // TODO: Remove this mock data and use the actual API endpoint when available
        const { status, page = 1, pageSize = 10 } = queryParams;

        const filtered = status ? mockCampaigns.filter((campaign) => campaign.status === status) : mockCampaigns;

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filtered.slice(startIndex, endIndex);

        const metadata = {
            page,
            pageSize,
            totalPages: Math.ceil(filtered.length / pageSize),
            totalRecords: filtered.length,
        };

        return Promise.resolve({
            metadata,
            data: paginatedData,
        });
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
