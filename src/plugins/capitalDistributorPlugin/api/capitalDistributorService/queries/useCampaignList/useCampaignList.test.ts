import { renderHook, waitFor } from '@testing-library/react';
import { generateCampaign } from '@/plugins/capitalDistributorPlugin/testUtils/generators';
import { Network } from '@/shared/api/daoService';
import {
    generatePaginatedResponse,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { capitalDistributorService } from '../../capitalDistributorService';
import { useCampaignList } from './useCampaignList';

describe('useCampaignList query', () => {
    const capitalDistributorServiceSpy = jest.spyOn(
        capitalDistributorService,
        'getCampaignList',
    );

    afterEach(() => {
        capitalDistributorServiceSpy.mockReset();
    });

    it('fetches the list of campaigns for the specified user', async () => {
        const campaignsResult = generatePaginatedResponse({
            data: [generateCampaign()],
        });
        capitalDistributorServiceSpy.mockResolvedValue(campaignsResult);

        const queryParams = {
            pluginAddress: '0x123',
            network: Network.BASE_MAINNET,
            userAddress: '0x456',
        };
        const { result } = renderHook(() => useCampaignList({ queryParams }), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() =>
            expect(result.current.data?.pages[0]).toEqual(campaignsResult),
        );
    });
});
