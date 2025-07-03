import { generateCampaign } from '@/plugins/capitalDistributorPlugin/testUtils/generators';
import { generatePaginatedResponse, ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { capitalDistributorService } from '../../capitalDistributorService';
import { useCampaignList } from './useCampaignList';

describe('useCampaignList query', () => {
    const capitalDistributorServiceSpy = jest.spyOn(capitalDistributorService, 'getCampaignList');

    afterEach(() => {
        capitalDistributorServiceSpy.mockReset();
    });

    it('fetches the campaign list for a user', async () => {
        const campaignsResult = generatePaginatedResponse({ data: [generateCampaign()] });
        capitalDistributorServiceSpy.mockResolvedValue(campaignsResult);

        const queryParams = { memberAddress: '0x123' };
        const { result } = renderHook(() => useCampaignList({ queryParams }), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(campaignsResult));
    });
});
