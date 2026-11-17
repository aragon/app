import { useInfiniteQuery } from '@tanstack/react-query';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IWorkspaceAccountSuggestion } from '../../domain';
import { workspaceQueryService } from '../../workspaceQueryService';
import type { IGetWorkspaceAccountSuggestionsParams } from '../../workspaceQueryService.api';
import { workspaceQueryServiceKeys } from '../../workspaceQueryServiceKeys';

// A wallet's accounts rarely change, and each read spends the shared Safe API quota.
const accountSuggestionsStaleTime = 10 * 60 * 1000;

export const workspaceAccountSuggestionListOptions = (
    params: IGetWorkspaceAccountSuggestionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IWorkspaceAccountSuggestion>,
        IGetWorkspaceAccountSuggestionsParams
    >,
): SharedInfiniteQueryOptions<
    IPaginatedResponse<IWorkspaceAccountSuggestion>,
    IGetWorkspaceAccountSuggestionsParams
> => ({
    queryKey: workspaceQueryServiceKeys.accountSuggestions(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        workspaceQueryService.getAccountSuggestions(pageParam),
    getNextPageParam: workspaceQueryService.getNextPageParams,
    staleTime: accountSuggestionsStaleTime,
    gcTime: accountSuggestionsStaleTime,
    ...options,
});

export const useWorkspaceAccountSuggestionList = (
    params: IGetWorkspaceAccountSuggestionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IWorkspaceAccountSuggestion>,
        IGetWorkspaceAccountSuggestionsParams
    >,
) => useInfiniteQuery(workspaceAccountSuggestionListOptions(params, options));
