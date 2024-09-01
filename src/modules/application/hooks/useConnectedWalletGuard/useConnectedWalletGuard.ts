import { useDialogContext } from '@/shared/components/dialogProvider';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ApplicationDialog } from '../../constants/moduleDialogs';

export interface IUseConnectedWalletGuardParams {
    /**
     * Callback called when user is successfully connected.
     */
    onSuccess?: () => void;
    /**
     * Callback called when user closes the dialog without connecting his wallet.
     */
    onError?: () => void;
}

export const useConnectedWalletGuard = (params?: IUseConnectedWalletGuardParams) => {
    const { onSuccess, onError } = params ?? {};

    const { isConnected } = useAccount();
    const { open } = useDialogContext();

    const checkWalletConnected = useCallback(() => {
        if (isConnected) {
            onSuccess?.();
            return;
        }

        const dialogParams = { onError, onSuccess };
        open(ApplicationDialog.CONNECT_WALLET, { params: dialogParams });
    }, [open, isConnected, onSuccess, onError]);

    return { check: checkWalletConnected, result: isConnected };
};
