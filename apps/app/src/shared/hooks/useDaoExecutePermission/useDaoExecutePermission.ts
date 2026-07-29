import { type Hex, keccak256, toBytes } from 'viem';
import { useReadContract } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { IDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { permissionManagerAbi } from '@/shared/utils/permissionTransactionUtils/abi/permissionManagerAbi';

export interface IUseDaoExecutePermissionParams {
    /**
     * DAO to check the execute permission on.
     */
    dao?: IDao;
}

export interface IUseDaoExecutePermissionResult {
    /**
     * Whether the connected wallet holds EXECUTE_PERMISSION on the DAO.
     */
    hasPermission: boolean;
    /**
     * Whether the on-chain permission check is still loading.
     */
    isLoading: boolean;
}

const executePermissionId = keccak256(
    toBytes(permissionTransactionUtils.permissionIds.executePermission),
);

/**
 * Checks on-chain whether the connected wallet holds EXECUTE_PERMISSION on the
 * DAO itself (`dao.hasPermission(dao, wallet, EXECUTE_PERMISSION, "0x")`).
 */
export const useDaoExecutePermission = (
    params: IUseDaoExecutePermissionParams,
): IUseDaoExecutePermissionResult => {
    const { dao } = params;

    const { address } = useWalletAccount();

    const chainId =
        dao != null ? networkDefinitions[dao.network].id : undefined;

    const { data, isLoading } = useReadContract({
        abi: permissionManagerAbi,
        address: dao?.address as Hex | undefined,
        functionName: 'hasPermission',
        args: [dao?.address as Hex, address as Hex, executePermissionId, '0x'],
        chainId,
        query: { enabled: address != null && dao != null },
    });

    return { hasPermission: data === true, isLoading };
};
