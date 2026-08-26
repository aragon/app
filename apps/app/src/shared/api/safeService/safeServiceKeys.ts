import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import { checksumSafeAddress } from './safeAddressUtils';
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

/**
 * Every key canonicalises the Safe address before it becomes part of the key. The address is the
 * cache identity, so a caller passing a lowercased address must land on the same entry as one
 * passing the checksummed form rather than duplicating the fetch.
 */
const withChecksummedAddress = <
    TParams extends { urlParams: { address: string } },
>(
    params: TParams,
): TParams => ({
    ...params,
    urlParams: {
        ...params.urlParams,
        address: checksumSafeAddress(params.urlParams.address),
    },
});

export const safeServiceKeys = {
    safeInfo: (params: IGetSafeInfoParams) => [
        SafeServiceKey.SAFE_INFO,
        apiVersionUtils.getApiVersion(),
        withChecksummedAddress(params),
    ],
    safePendingTransactions: (params: IGetSafePendingTransactionsParams) => [
        SafeServiceKey.SAFE_PENDING_TRANSACTIONS,
        apiVersionUtils.getApiVersion(),
        withChecksummedAddress(params),
    ],
    safeBalances: (params: IGetSafeBalancesParams) => [
        SafeServiceKey.SAFE_BALANCES,
        apiVersionUtils.getApiVersion(),
        withChecksummedAddress(params),
    ],
};
