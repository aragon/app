import { Network } from '@/shared/api/daoService';
import { generatePaginatedResponse } from '@/shared/testUtils';
import { generateCampaign } from '../../testUtils/generators';
import { capitalDistributorService } from './capitalDistributorService';

describe('capitalDistributor service', () => {
    const requestSpy = jest.spyOn(capitalDistributorService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getCampaignList fetches a paginated list of campaigns for the given member address', async () => {
        const campaignsList = [generateCampaign({ campaignId: '1' }), generateCampaign({ campaignId: '2' })];
        const campaignsListResponse = generatePaginatedResponse({ data: campaignsList });
        const params = {
            queryParams: { pluginAddress: '0x123', network: Network.BASE_MAINNET, userAddress: '0x456', pageSize: 2 },
        };

        requestSpy.mockResolvedValue(campaignsListResponse);
        const result = await capitalDistributorService.getCampaignList(params);

        expect(requestSpy).toHaveBeenCalledWith(capitalDistributorService['urls'].campaigns, params);
        expect(result).toEqual(campaignsListResponse);
    });
});
