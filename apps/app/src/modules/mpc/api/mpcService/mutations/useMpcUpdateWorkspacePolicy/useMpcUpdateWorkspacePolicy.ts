import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcWorkspacePolicyResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcUpdateWorkspacePolicyServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcUpdateWorkspacePolicy = (
    options?: MutationOptions<
        IMpcWorkspacePolicyResponse,
        unknown,
        IMpcUpdateWorkspacePolicyServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.updateWorkspacePolicy(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.prefix(
                    MpcServiceKey.WORKSPACE_POLICIES,
                ),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.workspacePolicy({
                    urlParams: params.urlParams,
                }),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
