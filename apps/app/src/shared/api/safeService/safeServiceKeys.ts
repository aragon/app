import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type {
    IGetSafeBalancesParams,
    IGetSafeInfoParams,
    IGetSafePendingTransactionsParams,
} from './safeService.api';

export enum SafeServiceKey {
    SAFE_INFO = 'SAFE_INFO',
    SAFE_PENDING_TRANSACTIONS = 'SAFE_PENDING_TRANSACTIONS',
    SAFE_BALANCES = 'SAFE_BALANCES',
}

export const safeServiceKeys = {
    safeInfo: (params: IGetSafeInfoParams) => [
        SafeServiceKey.SAFE_INFO,
        apiVersionUtils.getApiVersion(),
        params,
    ],
    safePendingTransactions: (params: IGetSafePendingTransactionsParams) => [
        SafeServiceKey.SAFE_PENDING_TRANSACTIONS,
        apiVersionUtils.getApiVersion(),
        params,
    ],
    safeBalances: (params: IGetSafeBalancesParams) => [
        SafeServiceKey.SAFE_BALANCES,
        apiVersionUtils.getApiVersion(),
        params,
    ],
};
