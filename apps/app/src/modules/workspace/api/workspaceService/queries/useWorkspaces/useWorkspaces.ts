import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';
import type { IGetWorkspacesParams } from '../../workspaceService.api';
import { workspaceServiceKeys } from '../../workspaceServiceKeys';

export const workspacesOptions = (
    params: IGetWorkspacesParams,
    options?: QueryOptions<IWorkspace[]>,
): SharedQueryOptions<IWorkspace[]> => ({
    queryKey: workspaceServiceKeys.workspaces(params),
    queryFn: () => workspaceService.getWorkspaces(params),
    ...options,
});

export const useWorkspaces = (
    params: IGetWorkspacesParams,
    options?: QueryOptions<IWorkspace[]>,
) => useQuery(workspacesOptions(params, options));
