import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { useCallback } from 'react';

export interface IUseGuardBaseParams {
    /**
     * Callback called when the user is capable of participating.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user cannot participate.
     */
    onError?: () => void;
}

export interface IUseConnectedParticipantGuardBaseParams {
    /**
     * Plugin to check permissions for.
     */
    plugin: ITabComponentPlugin<IDaoPlugin>;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface IUseConnectedParticipantGuard<TSlotParams extends IUseConnectedParticipantGuardBaseParams>
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

export const useConnectedParticipantGuard = <TSlotParams extends IUseConnectedParticipantGuardBaseParams>(
    params: IUseConnectedParticipantGuard<TSlotParams>,
) => {
    const { params: slotParams, slotId, onSuccess, onError } = params;

    const { check: checkWalletConnected, result: isConnected } = useConnectedWalletGuard({
        onError: () => {
            onError?.();
        },
        onSuccess: () => {
            checkPermissions();
            onSuccess?.();
        },
    });

    const { check: checkPermissions, result: hasPermissions } = usePermissionCheckGuard({
        params: slotParams,
        slotId,
        onError: () => {
            onError?.();
        },
        onSuccess: () => {
            onSuccess?.();
        },
    });

    const checkParticipation = useCallback(() => {
        if (!isConnected) {
            checkWalletConnected();
            return false;
        }

        if (!hasPermissions) {
            checkPermissions();
            return false;
        }

        onSuccess?.();
        return true;
    }, [isConnected, hasPermissions, onSuccess, checkWalletConnected, checkPermissions]);

    return { check: checkParticipation, result: isConnected && hasPermissions };
};
