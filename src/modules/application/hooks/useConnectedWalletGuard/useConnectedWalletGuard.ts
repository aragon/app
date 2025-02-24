import { useDialogContext } from '@/shared/components/dialogProvider';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ApplicationDialog } from '../../constants/moduleDialogs';

export interface IUseConnectedWalletGuardParams {
    /**
     * Callback called when the user successfully connects their wallet.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user does not connect their wallet.
     */
    onError?: () => void;
}

export const useConnectedWalletGuard = (params?: IUseConnectedWalletGuardParams) => {
    const { onSuccess, onError } = params ?? {};

    const { isConnected } = useAccount();
    const { open } = useDialogContext();

    const checkWalletConnected = useCallback(
        (functionParams?: Partial<IUseConnectedWalletGuardParams>) => {
            if (isConnected) {
                onSuccess?.();
                return;
            }

            const dialogParams = { onError, onSuccess, ...functionParams };
            open(ApplicationDialog.CONNECT_WALLET, { params: dialogParams });
        },
        [open, onSuccess, onError, isConnected],
    );

    return { check: checkWalletConnected, result: isConnected };
};
