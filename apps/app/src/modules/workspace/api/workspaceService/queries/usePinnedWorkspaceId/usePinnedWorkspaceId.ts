import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { workspaceService } from '../../workspaceService';
import { workspaceServiceKeys } from '../../workspaceServiceKeys';

export const pinnedWorkspaceIdOptions = (
    options?: QueryOptions<string | null>,
): SharedQueryOptions<string | null> => ({
    queryKey: workspaceServiceKeys.pinnedWorkspace(),
    queryFn: () => workspaceService.getPinnedWorkspaceId(),
    ...options,
});

export const usePinnedWorkspaceId = (options?: QueryOptions<string | null>) =>
    useQuery(pinnedWorkspaceIdOptions(options));
