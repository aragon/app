import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';
import type { IUpdateWorkspaceParams } from '../../workspaceService.api';

export const useUpdateWorkspace = (
    options?: MutationOptions<IWorkspace, unknown, IUpdateWorkspaceParams>,
) =>
    useMutation({
        mutationFn: (params) => workspaceService.updateWorkspace(params),
        ...options,
    });
