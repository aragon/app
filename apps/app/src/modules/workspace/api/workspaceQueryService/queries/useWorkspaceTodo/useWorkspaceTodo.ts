import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IWorkspaceTodoResponse } from '../../domain';
import { workspaceQueryService } from '../../workspaceQueryService';
import type { IGetWorkspaceTodoParams } from '../../workspaceQueryService.api';
import { workspaceQueryServiceKeys } from '../../workspaceQueryServiceKeys';

export const workspaceTodoOptions = (
    params: IGetWorkspaceTodoParams,
    options?: QueryOptions<IWorkspaceTodoResponse>,
): SharedQueryOptions<IWorkspaceTodoResponse> => ({
    queryKey: workspaceQueryServiceKeys.todo(params),
    queryFn: () => workspaceQueryService.getTodo(params),
    ...options,
});

/**
 * Reads the to-do list of a wallet across the accounts of a workspace. Not paginated: the backend caps both lists.
 */
export const useWorkspaceTodo = (
    params: IGetWorkspaceTodoParams,
    options?: QueryOptions<IWorkspaceTodoResponse>,
) => useQuery(workspaceTodoOptions(params, options));
