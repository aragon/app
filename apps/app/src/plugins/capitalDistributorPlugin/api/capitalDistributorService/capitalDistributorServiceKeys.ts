import type { IGetCampaignListParams } from './capitalDistributorService.api';

export enum CapitalDistributorServiceKey {
    CAMPAIGN_LIST = 'CAMPAIGN_LIST',
}

export const capitalDistributorServiceKeys = {
    campaigns: (params: IGetCampaignListParams) => [
        CapitalDistributorServiceKey.CAMPAIGN_LIST,
        params,
    ],
};
