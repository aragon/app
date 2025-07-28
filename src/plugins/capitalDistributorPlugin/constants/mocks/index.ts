import { claimableCampaignsMock } from './claimableCampaignsMock';
import { claimedCampaignsMock } from './claimedCampaignsMock';
import { injectPluginMock } from './injectPluginMock';
import { rewardStatsMock } from './rewardStatsMock';

export const capitalDistributorPluginMocks = [
    injectPluginMock,
    ...claimableCampaignsMock,
    ...claimedCampaignsMock,
    rewardStatsMock,
];
