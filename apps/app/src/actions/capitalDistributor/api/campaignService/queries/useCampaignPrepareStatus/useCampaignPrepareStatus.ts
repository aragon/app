import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { campaignService } from '../../campaignService';
import type { IGetCampaignPrepareStatusParams } from '../../campaignService.api';
import { campaignServiceKeys } from '../../campaignServiceKeys';
import type { ICampaignPrepareStatus } from '../../domain';

export const campaignPrepareStatusOptions = (
    params: IGetCampaignPrepareStatusParams,
    options?: QueryOptions<ICampaignPrepareStatus | null>,
): SharedQueryOptions<ICampaignPrepareStatus | null> => ({
    queryKey: campaignServiceKeys.campaignPrepareStatus(params),
    queryFn: () => campaignService.getCampaignPrepareStatus(params),
    ...options,
});

export const useCampaignPrepareStatus = (
    params: IGetCampaignPrepareStatusParams,
    options?: QueryOptions<ICampaignPrepareStatus | null>,
) => useQuery(campaignPrepareStatusOptions(params, options));
