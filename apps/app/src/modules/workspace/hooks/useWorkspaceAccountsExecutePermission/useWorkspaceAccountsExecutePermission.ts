'use client';

import { useMemo } from 'react';
import type { Hex } from 'viem';
import { useReadContracts } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { permissionManagerAbi } from '@/shared/utils/permissionTransactionUtils/abi/permissionManagerAbi';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';

export interface IUseWorkspaceAccountsExecutePermissionResult {
    /**
     * Whether the connected wallet can execute transactions on each account, keyed by account ID.
     */
    permissions: Record<string, boolean>;
    /**
     * Whether any of the checks is still in flight.
     */
    isPending: boolean;
}

const executePermissionId = permissionNameUtils.getPermissionId(
    permissionTransactionUtils.permissionIds.executePermission,
);

/**
 * Checks which accounts of a workspace the connected wallet can execute transactions on.
 *
 * The plural counterpart of `useDaoExecutePermission`, which the DAO transactions page uses: it reads the very same
 * `dao.hasPermission(dao, wallet, EXECUTE_PERMISSION, "0x")` call, batched into one `useReadContracts` so that a
 * page aggregating several accounts can both hide its create action and tell which rows are selectable. Every entry
 * carries its own `chainId`, as the accounts of a workspace may span networks.
 *
 * Every given account is reported rather than only the ones that were read, so callers can index the record
 * without defaulting. An account is reported as executable when the read says so, and — deliberately, see the
 * comment on the result below — also when the read could not run at all. It is reported as `false` when the read
 * denies it, while it is still in flight, and for an account type that is not read.
 *
 * This is where the plural form parts ways with `useDaoExecutePermission`, which collapses a failed read into
 * `false`; aligning the two is the TODO on the result below.
 * @param accounts - Accounts to check. Only DAO accounts are read, see below.
 * @returns The permission of every given account keyed by account ID, and whether any read is still pending.
 */
export const useWorkspaceAccountsExecutePermission = (
    accounts: IWorkspaceAccount[] = [],
): IUseWorkspaceAccountsExecutePermissionResult => {
    const { address } = useWalletAccount();

    // TODO(APP-1140): Safe accounts are deliberately left out of the batch and therefore always report `false`. A
    // Safe has no PermissionManager, so its eligibility is a different question: the connected address must be one
    // of its owners (`getOwners` / `isOwner`) or sit on its proposer list. Resolve that here and report those
    // accounts as executable too — `useIsSafeContract` and the `brandId: 'safe'` permission enrichment in
    // `shared/api/daoService/domain/daoPermission.ts` are the existing footholds. The create destination of a Safe
    // needs the same follow-up, see `workspaceTransactionsPageClient`.
    const daoAccounts = useMemo(
        () =>
            accounts.filter(
                (account) => account.type === WorkspaceAccountType.DAO,
            ),
        [accounts],
    );

    const contracts = useMemo(
        () =>
            daoAccounts.map((account) => ({
                abi: permissionManagerAbi,
                address: account.address as Hex,
                functionName: 'hasPermission',
                args: [
                    account.address as Hex,
                    address as Hex,
                    executePermissionId,
                    '0x',
                ],
                chainId: networkDefinitions[account.network].id,
            })),
        [daoAccounts, address],
    );

    const enabled = address != null && contracts.length > 0;

    const { data, isLoading } = useReadContracts({
        contracts,
        query: { enabled },
    });

    const permissions = useMemo(() => {
        const result: Record<string, boolean> = {};

        accounts.forEach((account) => {
            result[account.id] = false;
        });

        daoAccounts.forEach((account, index) => {
            const read = data?.[index];

            result[account.id] =
                read != null &&
                (read.status === 'failure' || read.result === true);
        });

        return result;
    }, [accounts, daoAccounts, data]);

    return { permissions, isPending: enabled && isLoading };
};
