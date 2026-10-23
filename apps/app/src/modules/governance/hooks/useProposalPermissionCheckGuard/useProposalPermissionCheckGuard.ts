import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
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
    /**
     * Runs the creation guard. Disable for read-only destinations.
     * @default true
     */
    enabled?: boolean;
}

export const useProposalPermissionCheckGuard = (
    params: IUseProposalPermissionCheckGuardParams,
) => {
    const {
        daoId,
        pluginAddress,
        redirectTab = 'dashboard',
        enabled = true,
    } = params;

    const router = useRouter();
    const { address: walletAddress } = useWalletAccount();

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

    const {
        check: createProposalGuard,
        result: canCreateProposal,
        isLoading: isPermissionCheckLoading,
    } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onError: handlePermissionCheckError,
        plugin,
        daoId,
    });

    const hasCalledGuardRef = useRef(false);
    const previousWalletAddressRef = useRef(walletAddress);
    const previousPluginAddressRef = useRef(plugin?.address);

    useEffect(() => {
        const hasWalletChanged =
            previousWalletAddressRef.current !== walletAddress;
        const hasPluginChanged =
            previousPluginAddressRef.current !== plugin?.address;

        if (hasWalletChanged || hasPluginChanged) {
            hasCalledGuardRef.current = false;
            previousWalletAddressRef.current = walletAddress;
            previousPluginAddressRef.current = plugin?.address;
        }

        if (
            enabled &&
            plugin != null &&
            !canCreateProposal &&
            !hasCalledGuardRef.current
        ) {
            hasCalledGuardRef.current = true;
            createProposalGuard();
        }
    }, [
        enabled,
        plugin,
        plugin?.address,
        canCreateProposal,
        createProposalGuard,
        walletAddress,
    ]);

    return {
        canCreateProposal,
        isLoading: isPermissionCheckLoading,
    };
};
