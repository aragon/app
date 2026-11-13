'use client';

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
 * The one view of a Safe this hook reads: whether an address is one of its current owners.
 */
const safeIsOwnerAbi = [
    {
        type: 'function',
        name: 'isOwner',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }],
    },
] as const;

/**
 * Checks which accounts of a workspace the connected wallet can execute transactions on.
 *
 * A DAO account reads the very same `dao.hasPermission(dao, wallet, EXECUTE_PERMISSION, "0x")` call as
 * `useDaoExecutePermission`, which the DAO transactions page uses. A Safe account has no PermissionManager: it reads
 * `safe.isOwner(wallet)` instead, as only an owner can create a transaction on it from the app (the create dialog
 * signs and proposes as that owner). Both are batched into one `useReadContracts`, so that a page aggregating several
 * accounts can both hide its create action and tell which rows are selectable. Every entry carries its own `chainId`,
 * as the accounts of a workspace may span networks.
 *
 * Every given account is reported rather than only the ones that were read, so callers can index the record
 * without defaulting. Only a read that answers in the affirmative reports `true`: a read that denies it, one that
 * could not run and one still in flight all report `false`.
 * @param accounts - Accounts to check.
 * @returns The permission of every given account keyed by account ID, and whether any read is still pending.
 */
export const useWorkspaceAccountsExecutePermission = (
    accounts: IWorkspaceAccount[] = [],
): IUseWorkspaceAccountsExecutePermissionResult => {
    const { address } = useWalletAccount();

    const contracts = accounts.map((account) => {
        const chainId = networkDefinitions[account.network].id;

        return account.type === WorkspaceAccountType.SAFE
            ? ({
                  abi: safeIsOwnerAbi,
                  address: account.address as Hex,
                  functionName: 'isOwner',
                  args: [address as Hex],
                  chainId,
              } as const)
            : ({
                  abi: permissionManagerAbi,
                  address: account.address as Hex,
                  functionName: 'hasPermission',
                  args: [
                      account.address as Hex,
                      address as Hex,
                      executePermissionId,
                      '0x',
                  ],
                  chainId,
              } as const);
    });

    const enabled = address != null && contracts.length > 0;

    const { data, isLoading } = useReadContracts({
        contracts,
        query: { enabled },
    });

    const permissions: Record<string, boolean> = {};

    accounts.forEach((account, index) => {
        const read = data?.[index];

        permissions[account.id] =
            read?.status === 'success' && read.result === true;
    });

    return { permissions, isPending: enabled && isLoading };
};
