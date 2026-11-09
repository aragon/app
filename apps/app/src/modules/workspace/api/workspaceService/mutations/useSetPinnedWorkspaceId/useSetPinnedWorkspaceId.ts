import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { workspaceService } from '../../workspaceService';

export const useSetPinnedWorkspaceId = (
    options?: MutationOptions<void, unknown, string | null>,
) =>
    useMutation({
        mutationFn: (id) => workspaceService.setPinnedWorkspaceId(id),
        ...options,
    });
