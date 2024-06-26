import type {
    InfiniteQueryObserverBaseResult,
    InfiniteQueryObserverLoadingErrorResult,
    InfiniteQueryObserverSuccessResult,
    QueryObserverBaseResult,
    QueryObserverLoadingErrorResult,
    QueryObserverSuccessResult,
} from '@tanstack/react-query';

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

export const generateReactQueryResultError = <TData, TError>(
    result?: Partial<QueryObserverLoadingErrorResult<TData, TError>>,
): QueryObserverLoadingErrorResult<TData, TError> => ({
    ...generateReactQueryResultBase(result),
    data: undefined,
    error: (result?.error ?? 'error') as TError,
    isError: true,
    isPending: false,
    isLoading: false,
    isLoadingError: true,
    isRefetchError: false,
    isSuccess: false,
    status: 'error',
});

export const generateReactQueryInfiniteResultBase = <TData, TError>(
    result?: Partial<InfiniteQueryObserverBaseResult<TData, TError>>,
): InfiniteQueryObserverBaseResult<TData, TError> => ({
    ...generateReactQueryResultBase(result),
    fetchNextPage: jest.fn(),
    fetchPreviousPage: jest.fn(),
    hasNextPage: false,
    hasPreviousPage: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    isFetchPreviousPageError: false,
    isFetchingPreviousPage: false,
    ...result,
});

export const generateReactQueryInfiniteResultSuccess = <TData, TError>(
    result?: Partial<InfiniteQueryObserverSuccessResult<TData, TError>>,
): InfiniteQueryObserverSuccessResult<TData, TError> => ({
    ...generateReactQueryInfiniteResultBase(result),
    data: (result?.data ?? {}) as TData,
    error: null,
    isError: false,
    isPending: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    isFetchNextPageError: false,
    isFetchPreviousPageError: false,
    status: 'success',
});

export const generateReactQueryInfiniteResultError = <TData, TError>(
    result?: Partial<InfiniteQueryObserverLoadingErrorResult<TData, TError>>,
): InfiniteQueryObserverLoadingErrorResult<TData, TError> => ({
    ...generateReactQueryInfiniteResultBase(result),
    data: undefined,
    error: (result?.error ?? 'error') as TError,
    isError: true,
    isPending: false,
    isLoading: false,
    isLoadingError: true,
    isRefetchError: false,
    isSuccess: false,
    isFetchNextPageError: false,
    isFetchPreviousPageError: false,
    status: 'error',
});
