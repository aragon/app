import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';

// A mutation rather than a query: it seeds the registry when it is empty, and reads must never write to it.
export const useGetOrCreateDefaultWorkspace = (
    options?: MutationOptions<IWorkspace, unknown, void>,
) =>
    useMutation({
        mutationFn: () => workspaceService.getOrCreateDefaultWorkspace(),
        ...options,
    });
