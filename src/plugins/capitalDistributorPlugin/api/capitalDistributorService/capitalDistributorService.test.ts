import { generatePaginatedResponse } from '@/shared/testUtils';
import { generateCampaign } from '../../testUtils/generators';
import { capitalDistributorService } from './capitalDistributorService';

describe('capitalDistributor service', () => {
    const requestSpy = jest.spyOn(capitalDistributorService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getCampaignList fetches a paginated list of campaigns for the given member address', async () => {
        const campaignsList = [generateCampaign({ id: 1 }), generateCampaign({ id: 2 })];
        const campaignsListResponse = generatePaginatedResponse({ data: campaignsList });
        const params = { queryParams: { memberAddress: '0x123', pageSize: 2 } };

        requestSpy.mockResolvedValue(campaignsListResponse);
        const result = await capitalDistributorService.getCampaignList(params);

        expect(requestSpy).toHaveBeenCalledWith(capitalDistributorService['urls'].campaigns, params);
        expect(result).toEqual(campaignsListResponse);
    });

    it('getCampaignStats fetches the campaign stats for a user', async () => {
        const campaignStats = { totalContributions: '1000', totalClaimed: '500' };
        const params = { urlParams: { memberAddress: '0x123' } };

        requestSpy.mockResolvedValue(campaignStats);
        const result = await capitalDistributorService.getCampaignStats(params);

        expect(requestSpy).toHaveBeenCalledWith(capitalDistributorService['urls'].stats, params);
        expect(result).toEqual(campaignStats);
    });
});
