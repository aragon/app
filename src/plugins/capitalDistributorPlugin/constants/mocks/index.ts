import { claimableCampaignsMock } from './claimableCampaignsMock';
import { claimedCampaignsMock } from './claimedCampaignsMock';
import { injectPluginMock } from './injectPluginMock';

export const capitalDistributorPluginMocks = [injectPluginMock, ...claimableCampaignsMock, ...claimedCampaignsMock];
