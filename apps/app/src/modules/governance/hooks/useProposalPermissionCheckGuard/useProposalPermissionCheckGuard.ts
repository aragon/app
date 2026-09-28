import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { useDao } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
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

export const useProposalPermissionCheckGuard = (
    params: IUseProposalPermissionCheckGuardParams,
) => {
    const { daoId, pluginAddress, redirectTab = 'dashboard' } = params;

    const router = useRouter();

    // The plugin is undefined when the DAO is not loaded yet or the plugin address is
    // unknown (e.g. a stale link to an uninstalled process) — the guard is skipped then.
    const plugin = useDaoPlugins({
        daoId,
        pluginAddress,
        includeLinkedAccounts: true,
    })?.[0]?.meta;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    // Use ref to avoid recreating the callback when dao changes
    const daoRef = useRef(dao);
    daoRef.current = dao;

    const handlePermissionCheckError = useCallback(
        () => router.push(daoUtils.getDaoUrl(daoRef.current, redirectTab)!),
        [router, redirectTab],
    );

    const { check: createProposalGuard, result: canCreateProposal } =
        usePermissionCheckGuard({
            permissionNamespace: 'proposal',
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            onError: handlePermissionCheckError,
            plugin,
            daoId,
        });

    // Use ref to track if the guard has already been called
    const hasCalledGuardRef = useRef(false);

    useEffect(() => {
        if (
            plugin != null &&
            !canCreateProposal &&
            !hasCalledGuardRef.current
        ) {
            hasCalledGuardRef.current = true;
            createProposalGuard();
        }
    }, [plugin, canCreateProposal, createProposalGuard]);
};
