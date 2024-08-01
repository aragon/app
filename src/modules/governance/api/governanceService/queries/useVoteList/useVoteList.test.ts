import { generateVote } from '@/modules/governance/testUtils';
import { ReactQueryWrapper, generatePaginatedResponse } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { governanceService } from '../../governanceService';
import { useVoteList } from './useVoteList';

describe('useVoteList query', () => {
    const governanceServiceSpy = jest.spyOn(governanceService, 'getVoteList');

    afterEach(() => {
        governanceServiceSpy.mockReset();
    });

    it('fetches the votes of the specified proposal', async () => {
        const params = { proposalId: 'proposal-id-test' };
        const votesResult = generatePaginatedResponse({ data: [generateVote()] });
        governanceServiceSpy.mockResolvedValue(votesResult);
        const { result } = renderHook(() => useVoteList({ queryParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(votesResult));
    });
});
