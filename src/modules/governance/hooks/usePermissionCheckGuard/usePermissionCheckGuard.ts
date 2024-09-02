import { type IUseNetworkGuardParams, useNetworkGuard } from '@/modules/application/hooks/useNetworkGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { useCallback } from 'react';
import { GovernanceDialog } from '../../constants/moduleDialogs';
import type { IPermissionCheckGuardResult } from '../../types';

export interface IUsePermissionCheckBaseParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface IUsePermissionCheckGuard<TSlotParams extends IUsePermissionCheckBaseParams>
    extends IUseNetworkGuardParams {
    /**
     * Parameters to be forwarded to the plugin-specific slot function.
     */
    params: TSlotParams;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
}

export const usePermissionCheckGuard = <TSlotParams extends IUsePermissionCheckBaseParams>(
    params: IUsePermissionCheckGuard<TSlotParams>,
) => {
    const { params: slotParams, slotId, network, onSuccess, onError } = params;
    const { daoId } = slotParams;

    const pluginIds = useDaoPluginIds(daoId);
    const { open } = useDialogContext();

    const { hasPermission } = useSlotFunction<IPermissionCheckGuardResult, TSlotParams>({
        slotId,
        pluginIds,
        params: slotParams,
    })!;

    const handleChangeNetworkSuccess = useCallback(() => {
        const dialogParams = { daoId, onSuccess, onError };
        open(GovernanceDialog.PERMISSION_CHECK, { params: dialogParams });
    }, [open, onSuccess, onError, daoId]);

    const { check: checkNetwork, result: isCorretNetwork } = useNetworkGuard({
        network,
        onError,
        onSuccess: handleChangeNetworkSuccess,
    });

    return { check: checkNetwork, result: isCorretNetwork && hasPermission };
};
