import { generateToken } from '@/modules/finance/testUtils';
import { CampaignStatus } from './../../api/capitalDistributorService/domain/enum/campaignStatus';
import type { ICampaign } from "@/plugins/capitalDistributorPlugin/api/capitalDistributorService";

export const generateCampaign = (campaign?: Partial<ICampaign>): ICampaign => ({
    id: 1,
    title: 'Campaign Name',
    description: 'Campaign Description',
    type: 'Type',
    status: CampaignStatus.CLAIMABLE,
    token: generateToken(),
    amount: '0',
    startTime: 0,
    endTime: 0,
    active: true,
    ...campaign,
});
