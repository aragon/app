import { useInfiniteQuery } from '@tanstack/react-query';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IWorkspaceProposalListResponse } from '../../domain';
import { workspaceQueryService } from '../../workspaceQueryService';
import type { IGetWorkspaceProposalListParams } from '../../workspaceQueryService.api';
import { workspaceQueryServiceKeys } from '../../workspaceQueryServiceKeys';

export const workspaceProposalListOptions = (
    params: IGetWorkspaceProposalListParams,
    options?: InfiniteQueryOptions<
        IWorkspaceProposalListResponse,
        IGetWorkspaceProposalListParams
    >,
): SharedInfiniteQueryOptions<
    IWorkspaceProposalListResponse,
    IGetWorkspaceProposalListParams
> => ({
    queryKey: workspaceQueryServiceKeys.proposalList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        workspaceQueryService.getProposalList(pageParam),
    getNextPageParam: workspaceQueryService.getNextBodyPageParams,
    ...options,
});

export const useWorkspaceProposalList = (
    params: IGetWorkspaceProposalListParams,
    options?: InfiniteQueryOptions<
        IWorkspaceProposalListResponse,
        IGetWorkspaceProposalListParams
    >,
) => useInfiniteQuery(workspaceProposalListOptions(params, options));
