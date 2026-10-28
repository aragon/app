import { useInfiniteQuery } from '@tanstack/react-query';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IWorkspaceMember } from '../../domain';
import { workspaceQueryService } from '../../workspaceQueryService';
import type {
    IGetWorkspaceMemberListParams,
    IWorkspaceQueryResponse,
} from '../../workspaceQueryService.api';
import { workspaceQueryServiceKeys } from '../../workspaceQueryServiceKeys';

export const workspaceMemberListOptions = (
    params: IGetWorkspaceMemberListParams,
    options?: InfiniteQueryOptions<
        IWorkspaceQueryResponse<IWorkspaceMember>,
        IGetWorkspaceMemberListParams
    >,
): SharedInfiniteQueryOptions<
    IWorkspaceQueryResponse<IWorkspaceMember>,
    IGetWorkspaceMemberListParams
> => ({
    queryKey: workspaceQueryServiceKeys.memberList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => workspaceQueryService.getMemberList(pageParam),
    getNextPageParam: workspaceQueryService.getNextBodyPageParams,
    ...options,
});

export const useWorkspaceMemberList = (
    params: IGetWorkspaceMemberListParams,
    options?: InfiniteQueryOptions<
        IWorkspaceQueryResponse<IWorkspaceMember>,
        IGetWorkspaceMemberListParams
    >,
) => useInfiniteQuery(workspaceMemberListOptions(params, options));
