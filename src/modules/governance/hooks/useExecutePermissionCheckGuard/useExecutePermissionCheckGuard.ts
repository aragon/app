import { addressUtils } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useDao } from '@/shared/api/daoService';
import { useDaoExecutePermission } from '@/shared/hooks/useDaoExecutePermission';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IUseExecutePermissionCheckGuardParams {
    /**
     * ID of the DAO to check the execute permission on.
     */
    daoId: string;
}

/**
 * Guards the direct-execute wizard: prompts the user to connect when no wallet
 * is connected, and redirects to the DAO transactions page when the connected
 * wallet does not hold EXECUTE_PERMISSION on the DAO.
 *
 * Re-runs on mount and whenever the connected account changes so switching from
 * a permitted to an unpermitted wallet still redirects.
 */
export const useExecutePermissionCheckGuard = (
    params: IUseExecutePermissionCheckGuardParams,
) => {
    const { daoId } = params;

    const router = useRouter();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { address } = useWalletAccount();
    const { check: checkWalletConnected, result: isConnected } =
        useConnectedWalletGuard();
    const { hasPermission, isLoading } = useDaoExecutePermission({ dao });

    // Track the account the guard last ran for so we re-check when the account changes.
    const checkedAddressRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        // Disconnected: always prompt to connect.
        if (!isConnected) {
            checkedAddressRef.current = undefined;
            checkWalletConnected();
            return;
        }

        // Wait for the DAO and the on-chain permission read to settle before deciding.
        if (dao == null || isLoading) {
            return;
        }

        // Only evaluate once per connected account.
        if (addressUtils.isAddressEqual(checkedAddressRef.current, address)) {
            return;
        }
        checkedAddressRef.current = address;

        if (!hasPermission) {
            const transactionsUrl = daoUtils.getDaoUrl(dao, 'transactions');

            if (transactionsUrl != null) {
                router.push(transactionsUrl);
            }
        }
    }, [
        address,
        checkWalletConnected,
        dao,
        hasPermission,
        isConnected,
        isLoading,
        router,
    ]);
};
