import { type ICampaign, rewardsService, rewardsServiceKeys } from "@/plugins/capitalDistributorPlugin/api/rewardsService";
import { type IGetCampaignsParams } from "@/plugins/capitalDistributorPlugin/api/rewardsService/rewardsService.api";
import { type QueryOptions, type SharedQueryOptions } from "@/shared/types/queryOptions";
import { useQuery } from "@tanstack/react-query";

export const campaignListOptions = (
  params: IGetCampaignsParams,
  options?: QueryOptions<ICampaign[]>
): SharedQueryOptions<ICampaign[]> => ({
  queryKey: rewardsServiceKeys.campaigns(params),
  queryFn: () => rewardsService.getCampaigns(params),
  ...options
});

export const useCampaignList = (
  params: IGetCampaignsParams,
  options?: QueryOptions<ICampaign[]>
) => {
  return useQuery(campaignListOptions(params, options));
};
