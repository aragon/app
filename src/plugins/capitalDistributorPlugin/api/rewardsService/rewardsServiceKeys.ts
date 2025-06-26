import type { IGetCampaignsParams, IGetCampaignStatsParams } from "./rewardsService.api";

export enum RewardsServiceKey {
  CAMPAIGN_LIST = 'CAMPAIGN_LIST',
  CAMPAIGN_STATS = 'CAMPAIGN_STATS',
}

export const rewardsServiceKeys = {
  campaigns: (params: IGetCampaignsParams) => [RewardsServiceKey.CAMPAIGN_LIST, params],
  campaignStats: (params: IGetCampaignStatsParams) => [RewardsServiceKey.CAMPAIGN_STATS, params],
}
