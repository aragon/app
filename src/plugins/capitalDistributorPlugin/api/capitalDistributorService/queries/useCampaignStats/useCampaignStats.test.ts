import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { capitalDistributorService } from '../../capitalDistributorService';
import { useCampaignStats } from './useCampaignStats';

describe('useCampaignStats query', () => {
    const capitalDistributorServiceSpy = jest.spyOn(capitalDistributorService, 'getCampaignStats');

    afterEach(() => {
        capitalDistributorServiceSpy.mockReset();
    });

    it('fetches the campaign stats for a user', async () => {
        const campaignStatsResult = { totalClaimed: '100', totalClaimable: '200' };

        capitalDistributorServiceSpy.mockResolvedValue(campaignStatsResult);

        const urlParams = { memberAddress: '0x123' };

        const { result } = renderHook(() => useCampaignStats({ urlParams }), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data).toEqual(campaignStatsResult));
    });
});
