import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { mpcService } from '../../mpcService';

import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcLogout = (
    options?: MutationOptions<null, unknown, void>,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => mpcService.logout(),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            // Drop every cached mpc query, the session is gone.
            queryClient.removeQueries({ queryKey: mpcServiceKeys.all() });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
