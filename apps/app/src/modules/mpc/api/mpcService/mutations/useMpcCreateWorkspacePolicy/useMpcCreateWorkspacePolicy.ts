import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcWorkspacePolicyResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcCreateWorkspacePolicyServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcCreateWorkspacePolicy = (
    options?: MutationOptions<
        IMpcWorkspacePolicyResponse,
        unknown,
        IMpcCreateWorkspacePolicyServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.createWorkspacePolicy(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.prefix(
                    MpcServiceKey.WORKSPACE_POLICIES,
                ),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
