import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IPluginSettings } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { useCallback } from 'react';
import { GovernanceDialog } from '../../constants/moduleDialogs';

export interface IUsePermissionCheckGuardParams {
    /**
     * Parameters to be forwarded to the plugin-specific slot function.
     */
    slotParams: IPermissionCheckGuardParams<IPluginSettings>;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
    /**
     * Callback called when the user has the required permissions.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user does not have the required permissions.
     */
    onError?: () => void;
    /**
     * Title of the permission check dialog.
     */
    dialogTitle: string;
    /**
     * Description of the permission check dialog.
     */
    dialogDescription: string;
}

export const usePermissionCheckGuard = (params: IUsePermissionCheckGuardParams) => {
    const { onSuccess, onError, slotParams, slotId, dialogTitle, dialogDescription } = params;
    const { plugin } = slotParams;

    const { open } = useDialogContext();

    const { hasPermission } = useSlotSingleFunction<
        IPermissionCheckGuardParams<IPluginSettings>,
        IPermissionCheckGuardResult
    >({
        slotId: slotId,
        pluginId: plugin.subdomain,
        params: slotParams,
    }) ?? { hasPermission: true };

    const handleWalletConnectionSuccess = useCallback(() => {
        const dialogParams = { slotParams, slotId, onError, onSuccess, dialogTitle, dialogDescription };
        open(GovernanceDialog.PERMISSION_CHECK, { params: dialogParams });
    }, [slotParams, slotId, onError, onSuccess, dialogTitle, dialogDescription, open]);

    const { check: checkWalletConnected, result: isConnected } = useConnectedWalletGuard({
        onError,
        onSuccess: handleWalletConnectionSuccess,
    });

    return { check: checkWalletConnected, result: isConnected && hasPermission };
};
