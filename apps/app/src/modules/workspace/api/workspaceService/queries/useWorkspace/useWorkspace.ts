import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';
import type { IGetWorkspaceParams } from '../../workspaceService.api';
import { workspaceServiceKeys } from '../../workspaceServiceKeys';

export const workspaceOptions = (
    params: IGetWorkspaceParams,
    options?: QueryOptions<IWorkspace>,
): SharedQueryOptions<IWorkspace> => ({
    queryKey: workspaceServiceKeys.workspace(params),
    queryFn: () => workspaceService.getWorkspace(params),
    ...options,
});

export const useWorkspace = (
    params: IGetWorkspaceParams,
    options?: QueryOptions<IWorkspace>,
) => useQuery(workspaceOptions(params, options));
