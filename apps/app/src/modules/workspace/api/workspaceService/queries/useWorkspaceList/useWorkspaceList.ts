import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';
import { workspaceServiceKeys } from '../../workspaceServiceKeys';

export const workspaceListOptions = (
    options?: QueryOptions<IWorkspace[]>,
): SharedQueryOptions<IWorkspace[]> => ({
    queryKey: workspaceServiceKeys.workspaceList(),
    queryFn: () => workspaceService.getWorkspaceList(),
    ...options,
});

export const useWorkspaceList = (options?: QueryOptions<IWorkspace[]>) =>
    useQuery(workspaceListOptions(options));
