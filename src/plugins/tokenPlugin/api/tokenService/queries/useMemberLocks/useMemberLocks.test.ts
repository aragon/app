import { Network } from '@/shared/api/daoService';
import { generatePaginatedResponse, ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { generateTokenLock } from '../../../../testUtils/generators/memberLock';
import { tokenService } from '../../tokenService';
import { useMemberLocks } from './useMemberLocks';

describe('useMemberLocks query', () => {
    const tokenServiceSpy = jest.spyOn(tokenService, 'getMemberLocks');

    afterEach(() => {
        tokenServiceSpy.mockReset();
    });

    it('fetches the specified member locks', async () => {
        const locksResult = generatePaginatedResponse({ data: [generateTokenLock()] });
        tokenServiceSpy.mockResolvedValue(locksResult);

        const urlParams = { address: '0x123' };
        const queryParams = { network: Network.ETHEREUM_SEPOLIA };
        const { result } = renderHook(() => useMemberLocks({ urlParams, queryParams }), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(locksResult));
    });
});
