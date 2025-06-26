import type { ICampaign, ICapitalDistributorStats } from "./domain";
import type { IGetCampaignListParams, IGetCampaignStatsParams } from "./rewardsService.api";
import { AragonBackendService } from "@/shared/api/aragonBackendService";

class RewardsService extends AragonBackendService {
    private urls = {
        campaigns: '/v1/campaigns',
        stats: '/v1/stats/:address',
    };

    getCampaigns = async (params: IGetCampaignListParams): Promise<ICampaign[]> => {
        const result = await this.request<ICampaign[]>(this.urls.campaigns, params);

        return result;
    };

    getCampaignStats = async (params: IGetCampaignStatsParams): Promise<ICapitalDistributorStats> => {
        const result = await this.request<ICapitalDistributorStats>(this.urls.stats, params);

        return result;
    };
}

export const rewardsService = new RewardsService();
