import { useMutation, type MutationOptions } from '@tanstack/react-query';
import type { ISession } from '../../domain';
import { walletConnectService } from '../../walletConnectService';
import type { IConnectAppParams } from '../../walletConnectService.api';

export const useConnectApp = (options?: MutationOptions<ISession, unknown, IConnectAppParams>) => {
    return useMutation({
        mutationFn: (params) => walletConnectService.connectApp(params),
        ...options,
    });
};
