import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcWorkspaceResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcCreateWorkspaceServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcCreateWorkspace = (
    options?: MutationOptions<
        IMpcWorkspaceResponse,
        unknown,
        IMpcCreateWorkspaceServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.createWorkspace(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.workspaces(),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
