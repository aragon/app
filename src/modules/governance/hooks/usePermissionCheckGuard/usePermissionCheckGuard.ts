import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IUseGuardBaseParams } from '@/modules/governance/types/useGuardBaseParams';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { useCallback } from 'react';
import { GovernanceDialog } from '../../constants/moduleDialogs';

export interface IUseCheckPermissionGuardBaseParams {
    /**
     * Plugin to check permissions for.
     */
    plugin: IDaoPlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface IUseCheckPermissionGuardParams<TSlotParams extends IUseCheckPermissionGuardBaseParams>
    extends IUseGuardBaseParams {
    /**
     * Parameters to be forwarded to the plugin-specific slot function.
     */
    params: TSlotParams;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
}

export interface IUsePermissionCheckGuardParams<TSlotParams extends IUseCheckPermissionGuardBaseParams>
    extends IUseGuardBaseParams {
    /**
     * Parameters to be forwarded to the plugin-specific slot function.
     */
    params: TSlotParams;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
}

export const usePermissionCheckGuard = <TSlotParams extends IUseCheckPermissionGuardBaseParams>(
    params: IUsePermissionCheckGuardParams<TSlotParams>,
) => {
    const { onSuccess, onError, params: slotParams, slotId } = params;
    const { plugin } = slotParams;

    const { open } = useDialogContext();

    const { hasPermission } =
        useSlotSingleFunction<IUseCheckPermissionGuardBaseParams, IPermissionCheckGuardResult>({
            slotId: slotId,
            pluginId: plugin.subdomain,
            params: slotParams,
        }) ?? {};

    const checkPermission = useCallback(() => {
        const dialogParams = { slotParams, slotId, onError, onSuccess };
        open(GovernanceDialog.PERMISSION_CHECK, {
            params: dialogParams,
        });
    }, [onError, onSuccess, open, slotParams, slotId]);

    const { check: checkConnect, result: isConnected } = useConnectedWalletGuard({
        onError: () => {
            onError?.();
        },
        onSuccess: () => {
            checkPermission();
        },
    });

    return { check: checkConnect, result: isConnected && hasPermission };
};
