import {
    AragonBackendService,
    type IPaginatedResponse,
} from '@/shared/api/aragonBackendService';
import type { IGetCampaignListParams } from './capitalDistributorService.api';
import type { ICampaign } from './domain';

class CapitalDistributorService extends AragonBackendService {
    private urls = {
        campaigns: '/capital-distributor/campaigns',
    };

    getCampaignList = async ({
        queryParams,
    }: IGetCampaignListParams): Promise<IPaginatedResponse<ICampaign>> => {
        const result = await this.request<IPaginatedResponse<ICampaign>>(
            this.urls.campaigns,
            { queryParams },
        );

        return result;
    };
}

export const capitalDistributorService = new CapitalDistributorService();
