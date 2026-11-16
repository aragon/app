import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IWorkspace } from '../../domain';
import { workspaceService } from '../../workspaceService';

export const useImportWorkspace = (
    options?: MutationOptions<IWorkspace, unknown, string>,
) =>
    useMutation({
        mutationFn: (rawExport) => workspaceService.importWorkspace(rawExport),
        ...options,
    });
