import type { InfiniteData, QueryKey, UseInfiniteQueryOptions, UseQueryOptions } from '@tanstack/react-query';

export type SharedInfiniteQueryOptions<TData, TParams> = UseInfiniteQueryOptions<
    TData,
    unknown,
    InfiniteData<TData>,
    TData,
    QueryKey,
    TParams
>;

export type InfiniteQueryOptions<TData, TParams> = Omit<
    UseInfiniteQueryOptions<TData, unknown, InfiniteData<TData>, TData, QueryKey, TParams>,
    'queryKey' | 'getNextPageParam' | 'initialPageParam'
>;

export type SharedQueryOptions<TData> = UseQueryOptions<TData>;

export type QueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey'>;
