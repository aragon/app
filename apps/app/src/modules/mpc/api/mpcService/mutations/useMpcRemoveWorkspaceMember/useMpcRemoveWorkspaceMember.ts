import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcWorkspaceMembersResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcRemoveWorkspaceMemberServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcRemoveWorkspaceMember = (
    options?: MutationOptions<
        IMpcWorkspaceMembersResponse,
        unknown,
        IMpcRemoveWorkspaceMemberServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.removeWorkspaceMember(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.workspaceMembers({
                    urlParams: { workspaceId: params.urlParams.workspaceId },
                }),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.prefix(MpcServiceKey.WORKSPACE),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
