import { useCallback, useRef } from 'react';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
// APP-946 hotfix import (remove in APP-957)
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IPermissionCheckDialogParams } from '../../dialogs/permissionCheckDialog';
// APP-946 hotfix import (remove in APP-957)
import { useCitreaCoreProposalCreationOverride } from '../useCitreaCoreProposalCreationOverride';

export interface IUsePermissionCheckGuardParams
    extends Omit<IPermissionCheckDialogParams, 'plugin'> {
    /**
     * Plugin to check permissions for.
     * Possibly undefined if all plugins have been uninstalled.
     */
    plugin?: IDaoPlugin;
}

export const usePermissionCheckGuard = (
    params: IUsePermissionCheckGuardParams,
) => {
    const {
        onSuccess,
        onError,
        slotId,
        permissionNamespace,
        plugin: pluginProp,
        daoId,
        proposal,
    } = params;

    const { open } = useDialogContext();

    // Use ref for plugin property as the plugin-specific permission-check hooks don't share the same hooks calls and if
    // the property is not stable we break the rules of hooks (see https://react.dev/warnings/invalid-hook-call-warning)
    const plugin = useRef(pluginProp).current;

    const { hasPermission } = useSlotSingleFunction<
        IPermissionCheckGuardParams,
        IPermissionCheckGuardResult
    >({
        slotId,
        pluginId: plugin?.interfaceType ?? '',
        params: { plugin: plugin as IDaoPlugin, daoId, proposal },
    }) ?? { hasPermission: true };

    // --- APP-946 temporary hotfix START (remove in APP-957:
    // https://linear.app/aragon/issue/APP-957) ---
    // Gate the Citrea "core" process proposal creation by Core Team Safe
    // ownership. No-op for every other DAO/process/slot. On removal: delete this
    // block, the two imports above (GovernanceSlotId,
    // useCitreaCoreProposalCreationOverride), and restore
    // `result: isConnected && hasPermission` in the return below.
    const citreaOverride = useCitreaCoreProposalCreationOverride({
        daoId,
        plugin,
    });
    const isProposalCreationSlot =
        slotId ===
        GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION;
    const effectiveHasPermission =
        isProposalCreationSlot && citreaOverride.isActive
            ? citreaOverride.hasPermission
            : hasPermission;
    // --- APP-946 temporary hotfix END ---

    const checkUserPermission = useCallback(
        (functionParams?: Partial<IUsePermissionCheckGuardParams>) => {
            const dialogParams = {
                slotId,
                onError,
                onSuccess,
                permissionNamespace,
                daoId,
                proposal,
                plugin,
                ...functionParams,
            };
            open(GovernanceDialogId.PERMISSION_CHECK, { params: dialogParams });
        },
        [
            slotId,
            onError,
            onSuccess,
            permissionNamespace,
            daoId,
            proposal,
            plugin,
            open,
        ],
    );

    const { check: checkWalletConnected, result: isConnected } =
        useConnectedWalletGuard({
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
        [
            isConnected,
            params.onError,
            checkUserPermission,
            checkWalletConnected,
        ],
    );

    return {
        check: checkFunction,
        // APP-946 hotfix (remove in APP-957): restore `isConnected && hasPermission`.
        result: isConnected && effectiveHasPermission,
    };
};
