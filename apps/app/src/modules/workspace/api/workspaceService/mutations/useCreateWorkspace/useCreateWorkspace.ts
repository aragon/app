import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';
import type { ICreateWorkspaceParams } from '../../workspaceService.api';

export const useCreateWorkspace = (
    options?: MutationOptions<IWorkspace, unknown, ICreateWorkspaceParams>,
) =>
    useMutation({
        mutationFn: (params) => workspaceService.createWorkspace(params),
        ...options,
    });
