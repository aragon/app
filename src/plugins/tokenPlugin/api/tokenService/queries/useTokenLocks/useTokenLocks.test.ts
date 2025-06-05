import { generatePaginatedResponse, ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { tokenService } from '../../tokenService';
import { generateTokenLock } from './../../../../testUtils/generators/tokenLock';
import { useTokenLocks } from './useTokenLocks';

describe('useTokenLocks query', () => {
    const tokenServiceSpy = jest.spyOn(tokenService, 'getTokenLocks');

    afterEach(() => {
        tokenServiceSpy.mockReset();
    });

    it('fetches the specified member locks', async () => {
        const locksResult = generatePaginatedResponse({ data: [generateTokenLock()] });
        tokenServiceSpy.mockResolvedValue(locksResult);

        const urlParams = { address: '0xmember' };
        const queryParams = {};
        const { result } = renderHook(() => useTokenLocks({ urlParams, queryParams }), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(locksResult));
    });
});
