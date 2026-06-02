import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
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
 * is connected and redirects to the DAO transactions page when the connected
 * wallet does not hold EXECUTE_PERMISSION on the DAO.
 *
 * Re-runs on mount and whenever the connected account changes, so switching from
 * a permitted to an unpermitted wallet still redirects.
 */
export const useExecutePermissionCheckGuard = (
    params: IUseExecutePermissionCheckGuardParams,
) => {
    const { daoId } = params;

    const router = useRouter();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { hasPermission, isLoading } = useDaoExecutePermission({ dao });

    const checkPermission = useCallback(() => {
        if (dao == null || isLoading) {
            return;
        }

        if (!hasPermission) {
            const transactionsUrl = daoUtils.getDaoUrl(dao, 'transactions');
            if (transactionsUrl != null) {
                router.push(transactionsUrl);
            }
        }
    }, [dao, hasPermission, isLoading, router]);

    const { check: checkWalletConnected } = useConnectedWalletGuard({
        onSuccess: checkPermission,
    });

    useEffect(() => {
        checkWalletConnected();
    }, [checkWalletConnected]);
};
