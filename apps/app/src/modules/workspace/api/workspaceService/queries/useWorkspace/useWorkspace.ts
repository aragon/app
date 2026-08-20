import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IWorkspaceDetails } from '../../domain';
import { workspaceService } from '../../workspaceService';
import type { IGetWorkspaceParams } from '../../workspaceService.api';
import { workspaceServiceKeys } from '../../workspaceServiceKeys';

export const workspaceOptions = (
    params: IGetWorkspaceParams,
    options?: QueryOptions<IWorkspaceDetails>,
): SharedQueryOptions<IWorkspaceDetails> => ({
    queryKey: workspaceServiceKeys.workspace(params),
    queryFn: () => workspaceService.getWorkspace(params),
    ...options,
});

export const useWorkspace = (
    params: IGetWorkspaceParams,
    options?: QueryOptions<IWorkspaceDetails>,
) => useQuery(workspaceOptions(params, options));
