import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type {
    IPermissionCheckGuardResult,
    IUsePermissionCheckGuardParams,
    IUsePermissionCheckGuardSlotParams,
} from '@/modules/governance/types';
import type { IPluginSettings } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { useCallback } from 'react';
import { GovernanceDialog } from '../../constants/moduleDialogs';

export const usePermissionCheckGuard = (params: IUsePermissionCheckGuardParams) => {
    const { onSuccess, onError, slotParams, slotId } = params;
    const { plugin } = slotParams;

    const { open } = useDialogContext();

    const { hasPermission } =
        useSlotSingleFunction<IUsePermissionCheckGuardSlotParams<IPluginSettings>, IPermissionCheckGuardResult>({
            slotId: slotId,
            pluginId: plugin.subdomain,
            params: slotParams,
        }) ?? {};

    const handleWalletConnectionSuccess = useCallback(() => {
        const dialogParams = { slotParams, slotId, onError, onSuccess };
        open(GovernanceDialog.PERMISSION_CHECK, { params: dialogParams });
    }, [onError, onSuccess, open, slotParams, slotId]);

    const { check: checkWalletConnected, result: isConnected } = useConnectedWalletGuard({
        onError,
        onSuccess: handleWalletConnectionSuccess,
    });

    return { check: checkWalletConnected, result: isConnected && hasPermission };
};
