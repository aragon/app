import { useDao } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useCallback } from 'react';
import { useConnectedWalletGuard } from '../../../application/hooks/useConnectedWalletGuard';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IUsePermissionCheckGuardParams } from '../usePermissionCheckGuard/usePermissionCheckGuard';

export interface IUseProposalExecuteGuardParams {
    /**
     * ID of the DAO to check permissions on.
     */
    daoId: string;
    /**
     * Plugin address used to create a proposal.
     */
    pluginAddress: string;
}

export const useProposalExecuteGuard = (params: IUseProposalExecuteGuardParams) => {
    const { daoId, pluginAddress } = params;

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress })![0];
    const { data: dao } = useDao({ urlParams: { id: daoId } });

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
        [slotId, onError, onSuccess, permissionNamespace, daoId, proposal, plugin, open],
    );

    const { check: checkWalletConnected, result: isConnected } = useConnectedWalletGuard({
        onError,
        onSuccess: checkUserPermission,
    });

    // const handlePermissionCheckError = useCallback(
    //     () => router.push(daoUtils.getDaoUrl(dao, redirectTab)!),
    //     [router, dao, redirectTab],
    // );
    //
    // const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
    //     permissionNamespace: 'proposal',
    //     slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
    //     onError: handlePermissionCheckError,
    //     plugin,
    //     daoId,
    // });
    //
    // useEffect(() => {
    //     if (!canCreateProposal) {
    //         createProposalGuard();
    //     }
    // }, [canCreateProposal, createProposalGuard]);
};
