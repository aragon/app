import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { workspaceService } from '../../workspaceService';
import { workspaceServiceKeys } from '../../workspaceServiceKeys';

export const useSetPinnedWorkspaceId = (
    options?: MutationOptions<void, unknown, string | null>,
) => {
    const queryClient = useQueryClient();
    const { onSuccess, ...mutationOptions } = options ?? {};

    return useMutation({
        mutationFn: (id) => workspaceService.setPinnedWorkspaceId(id),
        ...mutationOptions,
        onSuccess: async (...args) => {
            queryClient.setQueryData(
                workspaceServiceKeys.pinnedWorkspace(),
                args[1],
            );
            await onSuccess?.(...args);
        },
    });
};
