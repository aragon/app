import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcWorkspaceMembersResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcAddWorkspaceMemberServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcAddWorkspaceMember = (
    options?: MutationOptions<
        IMpcWorkspaceMembersResponse,
        unknown,
        IMpcAddWorkspaceMemberServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.addWorkspaceMember(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.workspaceMembers({
                    urlParams: params.urlParams,
                }),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.prefix(MpcServiceKey.WORKSPACE),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
