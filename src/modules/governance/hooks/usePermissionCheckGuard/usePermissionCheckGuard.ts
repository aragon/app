import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { useCallback, useRef } from 'react';
import { GovernanceDialog } from '../../constants/moduleDialogs';
import type { IPermissionCheckDialogParams } from '../../dialogs/permissionCheckDialog';

export interface IUsePermissionCheckGuardParams extends IPermissionCheckDialogParams {}

export const usePermissionCheckGuard = (params: IUsePermissionCheckGuardParams) => {
    const { onSuccess, onError, slotId, permissionNamespace, plugin: pluginProp, daoId } = params;

    const { open } = useDialogContext();

    // Use ref for plugin property as the plugin-specific permission-check hooks don't share the same hooks calls and if
    // the property is not stable we break the rules of hooks (see https://react.dev/warnings/invalid-hook-call-warning)
    const plugin = useRef(pluginProp).current;

    const { hasPermission } = useSlotSingleFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
        slotId: slotId,
        pluginId: plugin.subdomain,
        params: { plugin, daoId },
    }) ?? { hasPermission: true };

    const checkUserPermission = useCallback(
        (functionParams?: Partial<IUsePermissionCheckGuardParams>) => {
            const dialogParams = { slotId, onError, onSuccess, permissionNamespace, plugin, daoId, ...functionParams };
            open(GovernanceDialog.PERMISSION_CHECK, { params: dialogParams });
        },
        [slotId, onError, onSuccess, permissionNamespace, open, daoId, plugin],
    );

    const { check: checkWalletConnected, result: isConnected } = useConnectedWalletGuard({
        onError,
        onSuccess: checkUserPermission,
    });

    const checkFunction = useCallback(
        (functionParams?: Partial<IUsePermissionCheckGuardParams>) => {
            if (isConnected) {
                // Skip wallet-connection check if user is already connected
                checkUserPermission(functionParams);
            } else {
                // Make sure to forward custom checkFunction params to check-permission
                checkWalletConnected({
                    onError: functionParams?.onError ?? params.onError,
                    onSuccess: () => checkUserPermission(functionParams),
                });
            }
        },
        [isConnected, params.onError, checkUserPermission, checkWalletConnected],
    );

    return { check: checkFunction, result: isConnected && hasPermission };
};
