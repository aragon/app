import type { QueryObserverBaseResult, QueryObserverSuccessResult } from '@tanstack/react-query';

const generateReactQueryResultBase = <TData, TError>(
    result?: Partial<QueryObserverBaseResult<TData, TError>>,
): QueryObserverBaseResult<TData, TError> => ({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: 'success',
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    refetch: jest.fn(),
    fetchStatus: 'idle',
    ...result,
});

export const generateReactQueryResultSuccess = <TData, TError>(
    result?: Partial<QueryObserverSuccessResult<TData, TError>>,
): QueryObserverSuccessResult<TData, TError> => ({
    ...generateReactQueryResultBase(result),
    data: (result?.data ?? {}) as TData,
    error: null,
    isError: false,
    isPending: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: 'success',
});
