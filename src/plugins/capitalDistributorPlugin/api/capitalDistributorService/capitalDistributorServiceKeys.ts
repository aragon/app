import type { IGetCampaignsListParams, IGetCampaignStatsParams } from "./capitalDistributorService.api";

export enum CapitalDistributorServiceKey {
  CAMPAIGN_LIST = 'CAMPAIGN_LIST',
  CAMPAIGN_STATS = 'CAMPAIGN_STATS',
}

export const capitalDistributorServiceKeys = {
  campaigns: (params: IGetCampaignsListParams) => [CapitalDistributorServiceKey.CAMPAIGN_LIST, params],
  campaignStats: (params: IGetCampaignStatsParams) => [CapitalDistributorServiceKey.CAMPAIGN_STATS, params],
}
