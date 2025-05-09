import { useDao } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
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
     * @default dashboard
     */
    redirectTab?: 'dashboard' | 'proposals' | 'settings';
}

export const useProposalPermissionCheckGuard = (params: IUseProposalPermissionCheckGuardParams) => {
    const { daoId, pluginAddress, redirectTab = 'dashboard' } = params;

    const router = useRouter();

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress })![0];

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const handlePermissionCheckError = useCallback(
        () => router.push(daoUtils.getDaoUrl(dao, redirectTab) as __next_route_internal_types__.DynamicRoutes),
        [router, dao, redirectTab],
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
