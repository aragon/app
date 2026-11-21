import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';
import type { IUpdateWorkspaceDetailsParams } from '../../workspaceService.api';

export const useUpdateWorkspaceDetails = (
    options?: MutationOptions<
        IWorkspace,
        unknown,
        IUpdateWorkspaceDetailsParams
    >,
) =>
    useMutation({
        mutationFn: (params) => workspaceService.updateWorkspaceDetails(params),
        ...options,
    });
