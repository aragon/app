import { generateToken } from '@/modules/finance/testUtils';
import type { ICampaign } from '../../api/capitalDistributorService';
import { CampaignStatus } from '../../api/capitalDistributorService/domain/enum/campaignStatus';

export const generateCampaign = (campaign?: Partial<ICampaign>): ICampaign => ({
    id: 1,
    title: 'Campaign Name',
    description: 'Campaign Description',
    type: 'Type',
    token: generateToken(),
    startTime: 0,
    endTime: 0,
    active: true,
    multipleClaimsAllowed: false,
    strategy: null,
    userData: {
        status: CampaignStatus.CLAIMABLE,
        amount: '0',
    },
    ...campaign,
});
