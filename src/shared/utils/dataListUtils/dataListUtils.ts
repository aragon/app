import type { DataListState } from '@aragon/gov-ui-kit';

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

export interface IDataListFilterAvailability {
    /**
     * Number of items matching the filter.
     */
    itemsCount?: number;
    /**
     * Defines if the filter availability query is loading.
     */
    isPending?: boolean;
    /**
     * Defines if the filter availability query failed.
     */
    isError?: boolean;
}

class DataListUtils {
    getVisibleFilters = <TFilter extends string>(
        filters: TFilter[],
        availability: Partial<Record<TFilter, IDataListFilterAvailability>>,
        alwaysVisible: TFilter[] = [],
    ): TFilter[] =>
        filters.filter((filter) => {
            if (alwaysVisible.includes(filter)) {
                return true;
            }

            const filterAvailability = availability[filter];

            return (
                filterAvailability?.isPending ||
                filterAvailability?.isError ||
                (filterAvailability?.itemsCount ?? 0) > 0
            );
        });

    queryToDataListState = (
        params: IQueryToDataListStateParams,
    ): DataListState => {
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
                return fetchStatus === 'fetching'
                    ? 'loading'
                    : dataListIdleState;
            default:
                return 'idle';
        }
    };
}

export const dataListUtils = new DataListUtils();
