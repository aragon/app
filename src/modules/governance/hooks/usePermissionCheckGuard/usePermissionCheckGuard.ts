import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { GovernanceDialog } from '../../constants/moduleDialogs';

export interface IUsePermissionCheckBaseParams {
    /**
     * Plugin to check permissions for.
     */
    plugin: ITabComponentPlugin<IDaoPlugin>;
}

export interface IUsePermissionCheckGuard<TSlotParams extends IUsePermissionCheckBaseParams> {
    /**
     * Parameters to be forwarded to the plugin-specific slot function.
     */
    params: TSlotParams;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
    /**
     * Callback called when the user has the necessary permissions.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user does not have the necessary permissions.
     */
    onError?: () => void;
}

export const usePermissionCheckGuard = <TSlotParams extends IUsePermissionCheckBaseParams>(
    params: IUsePermissionCheckGuard<TSlotParams>,
) => {
    const { params: slotParams, slotId, onSuccess, onError } = params;
    const { plugin } = slotParams;

    const { address } = useAccount();

    const { open } = useDialogContext();

    const { check: checkWalletConnected, result: isConnected } = useConnectedWalletGuard({
        onSuccess: () => {
            if (onSuccess) {
                checkProposalCreationPermissions();
                onSuccess();
            }
        },
        onError: () => {
            if (onError) {
                onError();
            }
        },
    });

    const memberExistsParams = { memberAddress: address as string, pluginAddress: plugin.meta.address };
    const { data: isMember } = useMemberExists(
        {
            urlParams: memberExistsParams,
        },
        { enabled: isConnected && !!plugin.meta.address },
    );

    const checkProposalCreationPermissions = useCallback(() => {
        if (!isMember) {
            open(GovernanceDialog.PERMISSION_CHECK, {
                params: { slotId, onError, plugin },
            });
            onError?.();
            return false;
        }

        return true;
    }, [isMember, open, slotId, onError, plugin]);

    const checkPermissions = useCallback(() => {
        if (!isConnected) {
            checkWalletConnected();
            return false;
        }

        if (!isMember) {
            open(GovernanceDialog.PERMISSION_CHECK, {
                params: { slotId, slotParams, onError, plugin },
            });

            onError?.();
            return false;
        }

        return true;
    }, [checkWalletConnected, isConnected, isMember, onError, open, slotId, plugin, slotParams]);

    return { check: checkPermissions, result: isMember };
};
