import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useDaoPlugins } from '../../../../shared/hooks/useDaoPlugins';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { usePermissionCheckGuard } from '../usePermissionCheckGuard';

export interface IUseProposalPermissionCheckGuardParams {
    /**
     * ID of the DAO to check permissions on.
     */
    daoId: string;
    /**
     * Plugin address used to create a proposal.
     */
    pluginAddress: string;
    /**
     * Tab to redirect to if permission check fails.
     */
    permissionDeniedRedirectTab?: 'dashboard' | 'proposals' | 'settings';
}

export const useProposalPermissionCheckGuard = (params: IUseProposalPermissionCheckGuardParams) => {
    const { daoId, pluginAddress, permissionDeniedRedirectTab = 'dashboard' } = params;

    const router = useRouter();

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress })![0];

    const handlePermissionCheckError = useCallback(
        () => router.push(`/dao/${daoId}/${permissionDeniedRedirectTab}`),
        [router, daoId, permissionDeniedRedirectTab],
    );

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onError: handlePermissionCheckError,
        plugin,
        daoId,
    });

    useEffect(() => {
        if (!canCreateProposal) {
            createProposalGuard();
        }
    }, [canCreateProposal, createProposalGuard]);
};
