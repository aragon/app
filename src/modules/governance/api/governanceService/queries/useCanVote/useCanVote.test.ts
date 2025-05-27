import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { governanceService } from '../../governanceService';
import { useCanVote } from './useCanVote';

describe('useCanVote query', () => {
    const getCanVoteSpy = jest.spyOn(governanceService, 'getCanVote');

    afterEach(() => {
        getCanVoteSpy.mockReset();
    });

    it('fetches if the user can vote on the specified proposal', async () => {
        const canVote = true;
        getCanVoteSpy.mockResolvedValue(canVote);

        const params = { queryParams: { userAddress: '0x123' }, urlParams: { id: 'id' } };
        const { result } = renderHook(() => useCanVote(params), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data).toEqual(canVote));
    });
});
