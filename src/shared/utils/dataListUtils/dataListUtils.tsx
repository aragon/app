import type { DataListState } from '@aragon/ods';

export interface IQueryToDataListStateParams {
    /**
     * Status of the query.
     */
    status: 'pending' | 'error' | 'success';
    /**
     * Fetch status of the query.
     */
    fetchStatus: 'fetching' | 'paused' | 'idle';
    /**
     * Defines if the query has some filters applied.
     */
    hasFilters?: boolean;
    /**
     * Defines if query is fetching the next page.
     */
    isFetchingNextPage?: boolean;
}

class DataListUtils {
    queryToDataListState = (params: IQueryToDataListStateParams): DataListState => {
        const { status, fetchStatus, hasFilters, isFetchingNextPage } = params;

        const dataListIdleState = hasFilters ? 'filtered' : 'idle';

        if (isFetchingNextPage) {
            return 'fetchingNextPage';
        }

        switch (status) {
            case 'error':
                return 'error';
            case 'pending':
                return 'initialLoading';
            case 'success':
                return fetchStatus === 'fetching' ? 'loading' : dataListIdleState;
        }
    };
}

export const dataListUtils = new DataListUtils();
