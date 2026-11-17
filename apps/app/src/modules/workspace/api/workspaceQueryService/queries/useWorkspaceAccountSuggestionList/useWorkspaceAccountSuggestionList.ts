import { useInfiniteQuery } from '@tanstack/react-query';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IWorkspaceAccountSuggestionListResponse } from '../../domain';
import { workspaceQueryService } from '../../workspaceQueryService';
import type { IGetWorkspaceAccountSuggestionsParams } from '../../workspaceQueryService.api';
import { workspaceQueryServiceKeys } from '../../workspaceQueryServiceKeys';

// A wallet's accounts rarely change, and each read spends the shared Safe API quota.
const accountSuggestionsStaleTime = 10 * 60 * 1000;
// An incomplete list goes stale sooner, so it is read again.
const incompleteSuggestionsStaleTime = 30 * 1000;

export const workspaceAccountSuggestionListOptions = (
    params: IGetWorkspaceAccountSuggestionsParams,
    options?: InfiniteQueryOptions<
        IWorkspaceAccountSuggestionListResponse,
        IGetWorkspaceAccountSuggestionsParams
    >,
): SharedInfiniteQueryOptions<
    IWorkspaceAccountSuggestionListResponse,
    IGetWorkspaceAccountSuggestionsParams
> => ({
    queryKey: workspaceQueryServiceKeys.accountSuggestions(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        workspaceQueryService.getAccountSuggestions(pageParam),
    getNextPageParam: workspaceQueryService.getNextPageParams,
    staleTime: ({ state }) =>
        state.data?.pages.some((page) => page.isIncomplete)
            ? incompleteSuggestionsStaleTime
            : accountSuggestionsStaleTime,
    gcTime: accountSuggestionsStaleTime,
    ...options,
});

export const useWorkspaceAccountSuggestionList = (
    params: IGetWorkspaceAccountSuggestionsParams,
    options?: InfiniteQueryOptions<
        IWorkspaceAccountSuggestionListResponse,
        IGetWorkspaceAccountSuggestionsParams
    >,
) => useInfiniteQuery(workspaceAccountSuggestionListOptions(params, options));
