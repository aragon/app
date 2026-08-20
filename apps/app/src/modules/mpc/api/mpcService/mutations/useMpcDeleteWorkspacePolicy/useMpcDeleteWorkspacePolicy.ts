import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { mpcService } from '../../mpcService';
import type { IMpcDeleteWorkspacePolicyServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcDeleteWorkspacePolicy = (
    options?: MutationOptions<
        null,
        unknown,
        IMpcDeleteWorkspacePolicyServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.deleteWorkspacePolicy(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.prefix(
                    MpcServiceKey.WORKSPACE_POLICIES,
                ),
            });
            void queryClient.removeQueries({
                queryKey: mpcServiceKeys.workspacePolicy({
                    urlParams: params.urlParams,
                }),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
