import { dataListUtils } from './dataListUtils';

describe('dataList utils', () => {
    describe('getVisibleFilters', () => {
        const filters = ['all', 'received', 'sent', 'executions'];

        it('returns always-visible and available filters', () => {
            const result = dataListUtils.getVisibleFilters(
                filters,
                {
                    received: { itemsCount: 0 },
                    sent: { itemsCount: 2 },
                    executions: { itemsCount: 1 },
                },
                ['all'],
            );

            expect(result).toEqual(['all', 'sent', 'executions']);
        });

        it('keeps filters visible while availability is pending or failed', () => {
            const result = dataListUtils.getVisibleFilters(filters, {
                all: { itemsCount: 0 },
                received: { isPending: true },
                sent: { isError: true },
                executions: { itemsCount: 0 },
            });

            expect(result).toEqual(['received', 'sent']);
        });
    });

    describe('queryToDataListState', () => {
        it('returns fetchinNextPage state when query is fetching next page', () => {
            const state = dataListUtils.queryToDataListState({
                status: 'success',
                fetchStatus: 'fetching',
                isFetchingNextPage: true,
            });
            expect(state).toEqual('fetchingNextPage');
        });

        it('returns error state on query error', () => {
            const state = dataListUtils.queryToDataListState({
                status: 'error',
                fetchStatus: 'idle',
            });
            expect(state).toEqual('error');
        });

        it('returns loading state when fetching data without cached data', () => {
            const state = dataListUtils.queryToDataListState({
                status: 'pending',
                fetchStatus: 'fetching',
            });
            expect(state).toEqual('initialLoading');
        });

        it('returns loading state on query success and query is fetching data', () => {
            const state = dataListUtils.queryToDataListState({
                status: 'success',
                fetchStatus: 'fetching',
            });
            expect(state).toEqual('loading');
        });

        it('returns idle state on query success and query is not fetching data', () => {
            const state = dataListUtils.queryToDataListState({
                status: 'success',
                fetchStatus: 'idle',
            });
            expect(state).toEqual('idle');
        });

        it('returns filtered state on query success, query is not fetching data and filters are applied to query', () => {
            const state = dataListUtils.queryToDataListState({
                status: 'success',
                fetchStatus: 'idle',
                hasFilters: true,
            });
            expect(state).toEqual('filtered');
        });
    });
});
