import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultLoading,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as governanceService from '../../api/governanceService';
import { generateVote } from '../../testUtils';
import { useVoteListData } from './useVoteListData';

describe('useVoteListData hook', () => {
    const useVoteListSpy = jest.spyOn(governanceService, 'useVoteList');

    afterEach(() => {
        useVoteListSpy.mockReset();
    });

    it('fetches and returns the data needed to display the vote list', () => {
        const votes = [generateVote({ transactionHash: '0x123' })];
        const votesMetadata = generatePaginatedResponseMetadata({ pageSize: 20, totalRecords: votes.length });
        const votesResponse = generatePaginatedResponse({ data: votes, metadata: votesMetadata });
        const params = { queryParams: { proposalId: 'my-proposal', pluginAddress: '0x123' } };

        useVoteListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [votesResponse], pageParams: [] } }),
        );

        const { result } = renderHook(() => useVoteListData(params));

        expect(useVoteListSpy).toHaveBeenCalledWith(params);
        expect(result.current.voteList).toEqual(votes);
        expect(result.current.onLoadMore).toBeDefined();
        expect(result.current.pageSize).toEqual(votesMetadata.pageSize);
        expect(result.current.itemsCount).toEqual(votes.length);
        expect(result.current.emptyState).toBeDefined();
        expect(result.current.errorState).toBeDefined();
        expect(result.current.state).toEqual('idle');
    });

    it('returns error state when fetching votes fails', () => {
        useVoteListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error('error') }));

        const { result } = renderHook(() => useVoteListData({ queryParams: { pluginAddress: '0x123' } }));

        expect(result.current.state).toEqual('error');
    });

    it('returns the pageSize set as a hook parameter when data is loading', () => {
        useVoteListSpy.mockReturnValue(generateReactQueryInfiniteResultLoading());

        const pageSize = 6;
        const { result } = renderHook(() => useVoteListData({ queryParams: { pageSize, pluginAddress: '0x123' } }));

        expect(result.current.pageSize).toEqual(pageSize);
    });
});
