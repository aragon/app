import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { walletConnectService } from '../../walletConnectService';
import type { IDisconnectAppParams } from '../../walletConnectService.api';

export const useDisconnectApp = (options?: MutationOptions<void, unknown, IDisconnectAppParams>) => {
    return useMutation({
        mutationFn: (params) => walletConnectService.disconnectApp(params),
        ...options,
    });
};
