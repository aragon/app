'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import type {
    IWorkspacePageParams,
    QueryOptions,
    SharedQueryOptions,
} from '@/shared/types';
import { workspaceUtils } from '../../../../utils/workspaceUtils';
import type { IWorkspace, WorkspaceRegistryScope } from '../../domain';
import { workspaceService } from '../../workspaceService';
import { workspaceServiceKeys } from '../../workspaceServiceKeys';

export const workspaceListOptions = (
    scope: WorkspaceRegistryScope,
    options?: QueryOptions<IWorkspace[]>,
): SharedQueryOptions<IWorkspace[]> => ({
    queryKey: workspaceServiceKeys.workspaceList(scope),
    queryFn: () => workspaceService.getWorkspaceList(scope),
    ...options,
});

/**
 * Lists the workspaces of the route's registry: the demo ones on a demo workspace route, the persistent ones elsewhere.
 */
export const useWorkspaceList = (options?: QueryOptions<IWorkspace[]>) => {
    // Null outside the App Router, e.g. in tests that do not mock the route.
    const workspaceId = useParams<Partial<IWorkspacePageParams>>()?.workspaceId;
    const scope = workspaceUtils.getRegistryScope(workspaceId);

    return useQuery(workspaceListOptions(scope, options));
};
