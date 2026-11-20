import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';
import type { IRemoveWorkspaceAccountParams } from '../../workspaceService.api';

export const useRemoveWorkspaceAccount = (
    options?: MutationOptions<
        IWorkspace,
        unknown,
        IRemoveWorkspaceAccountParams
    >,
) =>
    useMutation({
        mutationFn: (params) => workspaceService.removeWorkspaceAccount(params),
        ...options,
    });
