import { capitalDistributorService } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { generateCampaign } from '@/plugins/capitalDistributorPlugin/testUtils/generators';
import { generatePaginatedResponse } from '@/shared/testUtils';

describe('capitalDistributor service', () => {
    const requestSpy = jest.spyOn(capitalDistributorService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getCampaignsList fetches a paginated list campaign list of campaigns given a member address', async () => {
        const campaignsList = [generateCampaign({ id: 1 }), generateCampaign({ id: 2 })];
        const campaignsListResponse = generatePaginatedResponse({ data: campaignsList });
        const params = { queryParams: { memberAddress: '0x123', pageSize: 2 } };

        requestSpy.mockResolvedValue(campaignsListResponse);
        const result = await capitalDistributorService.getCampaignsList(params);

        expect(requestSpy).toHaveBeenCalledWith(capitalDistributorService['urls'].campaigns, params);
        expect(result).toEqual(campaignsListResponse);
    });

    it('getCampaignStats fetches the stats of a campaign for a user', async () => {
        const campaignStats = { totalContributions: '1000', totalClaimed: '500' };
        const params = { urlParams: { memberAddress: '0x123' } };

        requestSpy.mockResolvedValue(campaignStats);
        const result = await capitalDistributorService.getCampaignStats(params);

        expect(requestSpy).toHaveBeenCalledWith(capitalDistributorService['urls'].stats, params);
        expect(result).toEqual(campaignStats);
    });
});
