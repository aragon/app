import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';
import type { IAddWorkspaceAccountParams } from '../../workspaceService.api';

export const useAddWorkspaceAccount = (
    options?: MutationOptions<IWorkspace, unknown, IAddWorkspaceAccountParams>,
) =>
    useMutation({
        mutationFn: (params) => workspaceService.addWorkspaceAccount(params),
        ...options,
    });
