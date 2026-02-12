import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type { IGetCampaignPrepareStatusParams } from './campaignService.api';

export enum CampaignServiceKey {
    CAMPAIGN_PREPARE_STATUS = 'CAMPAIGN_PREPARE_STATUS',
}

export const campaignServiceKeys = {
    campaignPrepareStatus: (params: IGetCampaignPrepareStatusParams) => [
        CampaignServiceKey.CAMPAIGN_PREPARE_STATUS,
        apiVersionUtils.getApiVersion(),
        params,
    ],
};
