import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcMembersResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcRemoveMemberServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcRemoveMember = (
    options?: MutationOptions<
        IMpcMembersResponse,
        unknown,
        IMpcRemoveMemberServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.removeMember(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.members({
                    urlParams: { systemId: params.urlParams.systemId },
                }),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.system({
                    urlParams: { systemId: params.urlParams.systemId },
                }),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.prefix(MpcServiceKey.SYSTEMS),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.activity({
                    urlParams: { systemId: params.urlParams.systemId },
                }),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
