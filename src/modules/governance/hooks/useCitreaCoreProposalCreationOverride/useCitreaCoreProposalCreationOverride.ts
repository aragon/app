import type { Hex } from 'viem';
import { useReadContract } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { type IDaoPlugin, Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

/**
 * APP-946 — TEMPORARY EMERGENCY HOTFIX.
 *
 * The Citrea DAO "core" governance process has a permission-deployment bug: its
 * on-chain proposal-creation check effectively passes for everyone. Until the
 * proper on-chain fix ships, this hook gates proposal creation on that single
 * process at the UI level: it is disabled by default and only enabled when the
 * connected wallet is an owner of the Core Team Safe that creates proposals in
 * the process's first stage ("Core Team Proposal").
 *
 * Scope is intentionally narrow — only the Citrea "core" SPP process. The sibling
 * "ga"/"poll" processes (and every other DAO) are untouched. This whole file is
 * meant to be reverted as a single unit once the deployment is fixed.
 *
 * ⚠️ REMOVAL (APP-957: https://linear.app/aragon/issue/APP-957):
 * Delete this entire directory
 * (`src/modules/governance/hooks/useCitreaCoreProposalCreationOverride/`) and the
 * two call sites flagged with the same APP-957 marker:
 *   - src/modules/governance/hooks/usePermissionCheckGuard/usePermissionCheckGuard.ts
 *   - src/modules/governance/dialogs/permissionCheckDialog/permissionCheckDialog.tsx
 */
const citreaCoreHotfix = {
    // DAO id is `${network}-${address}`, lowercased for comparison.
    daoId: 'citrea-mainnet-0xa941b1c1d9adc88c9241aa3aca59e8b8f0386419',
    // SPP plugin for the "core" (Core Governance) process.
    processAddress: '0x17f4d6c94782a8c9bb44f3c0f9f9ac3d77b84ad6',
    // Gnosis Safe (Core Team) that creates proposals in stage 0 of the process.
    safeAddress: '0xCEe28Dd08403bF94f7db5bB986722d5494636BB2' as Hex,
} as const;

const safeGetOwnersAbi = [
    {
        type: 'function',
        name: 'getOwners',
        inputs: [],
        outputs: [{ name: '', type: 'address[]' }],
        stateMutability: 'view',
    },
] as const;

export interface IUseCitreaCoreProposalCreationOverrideParams {
    /**
     * ID of the DAO the proposal would be created in.
     */
    daoId?: string;
    /**
     * Plugin (governance process) the proposal would be created on.
     */
    plugin?: IDaoPlugin;
}

export interface IUseCitreaCoreProposalCreationOverrideResult {
    /**
     * Whether the hotfix applies to the current DAO/process. When false the
     * hook is a no-op and callers must fall back to the normal permission check.
     */
    isActive: boolean;
    /**
     * Whether the connected wallet is allowed to create a proposal. Defaults to
     * false (deny) while loading, when disconnected, or when not a Safe owner.
     */
    hasPermission: boolean;
    /**
     * Whether the Safe owners read is still in flight.
     */
    isLoading: boolean;
}

export const useCitreaCoreProposalCreationOverride = (
    params: IUseCitreaCoreProposalCreationOverrideParams,
): IUseCitreaCoreProposalCreationOverrideResult => {
    const { daoId, plugin } = params;

    const { address } = useWalletAccount();

    const isActive =
        daoId?.toLowerCase() === citreaCoreHotfix.daoId &&
        plugin?.address?.toLowerCase() === citreaCoreHotfix.processAddress;

    const { id: chainId } = networkDefinitions[Network.CITREA_MAINNET];

    const { data: owners, isLoading } = useReadContract({
        chainId,
        address: citreaCoreHotfix.safeAddress,
        abi: safeGetOwnersAbi,
        functionName: 'getOwners',
        query: { enabled: isActive && address != null },
    });

    const hasPermission =
        isActive &&
        address != null &&
        (owners?.some(
            (owner) => owner.toLowerCase() === address.toLowerCase(),
        ) ??
            false);

    return { isActive, hasPermission, isLoading: isActive && isLoading };
};
