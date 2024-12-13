import type { IUseGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticipantGuard/useConnectedParticipantGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ApplicationDialog } from '../../constants/moduleDialogs';

export interface IUseConnectedWalletGuardParams extends IUseGuardBaseParams {}

export const useConnectedWalletGuard = (params?: IUseConnectedWalletGuardParams) => {
    const { onSuccess, onError } = params ?? {};

    const { isConnected } = useAccount();
    const { open } = useDialogContext();

    const checkWalletConnected = useCallback(() => {
        const dialogParams = { onError, onSuccess };
        open(ApplicationDialog.CONNECT_WALLET, { params: dialogParams });
    }, [open, onSuccess, onError]);

    return { check: checkWalletConnected, result: isConnected };
};
