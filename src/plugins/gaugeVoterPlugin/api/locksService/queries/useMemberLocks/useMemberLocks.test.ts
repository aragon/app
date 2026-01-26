import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    generatePaginatedResponse,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { generateGaugeVoterLock } from '../../../../testUtils/generators/memberLock';
import { locksService } from '../../locksService';
import { useMemberLocks } from './useMemberLocks';

describe('useMemberLocks query', () => {
    const locksServiceSpy = jest.spyOn(locksService, 'getMemberLocks');

    afterEach(() => {
        locksServiceSpy.mockReset();
    });

    it('fetches the specified member locks', async () => {
        const locksResult = generatePaginatedResponse({
            data: [generateGaugeVoterLock()],
        });
        locksServiceSpy.mockResolvedValue(locksResult);

        const urlParams = { address: '0x123' };
        const queryParams = {
            network: Network.ETHEREUM_SEPOLIA,
            escrowAddress: '0x456',
        };
        const { result } = renderHook(
            () => useMemberLocks({ urlParams, queryParams }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() =>
            expect(result.current.data?.pages[0]).toEqual(locksResult),
        );
    });
});
