import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IWorkspace, IWorkspaceAccount } from '../../domain';
import { workspaceService } from '../../workspaceService';

export const useCreateDefaultWorkspace = (
    options?: MutationOptions<IWorkspace, unknown, IWorkspaceAccount[]>,
) =>
    useMutation({
        mutationFn: (accounts) =>
            workspaceService.createDefaultWorkspace(accounts),
        ...options,
    });
