import { type ICampaign } from "../../domain";
import { type IGetCampaignsListParams } from "../../capitalDistributorService.api";
import { capitalDistributorServiceKeys } from "../../capitalDistributorServiceKeys";
import type { QueryOptions, SharedQueryOptions } from '@/shared/types/queryOptions';
import { useQuery } from "@tanstack/react-query";
import { capitalDistributorService } from "../../capitalDistributorService";

export const campaignListOptions = (
  params: IGetCampaignsListParams,
  options?: QueryOptions<ICampaign[]>
): SharedQueryOptions<ICampaign[]> => ({
  queryKey: capitalDistributorServiceKeys.campaigns(params),
  queryFn: () => capitalDistributorService.getCampaignsList(params),
  ...options
});

export const useCampaignList = (
  params: IGetCampaignsListParams,
  options?: QueryOptions<ICampaign[]>
) => {
  return useQuery(campaignListOptions(params, options));
};
