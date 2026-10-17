import type { DataListState } from '@aragon/gov-ui-kit';

export interface IGetDataListStateParams {
    /**
     * Whether the underlying query failed.
     */
    isError: boolean;
    /**
     * Whether the underlying query is fetching for the first time.
     */
    isLoading: boolean;
}

class SafeDataListUtils {
    /**
     * Maps the flags of a TanStack query onto the state expected by the DataList primitives. The
     * Safe read view never paginates or filters, so only the three terminal states can occur.
     */
    getDataListState = (params: IGetDataListStateParams): DataListState => {
        const { isError, isLoading } = params;

        if (isError) {
            return 'error';
        }

        if (isLoading) {
            return 'initialLoading';
        }

        return 'idle';
    };
}

export const safeDataListUtils = new SafeDataListUtils();
