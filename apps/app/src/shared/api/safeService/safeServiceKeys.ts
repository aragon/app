import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import { checksumSafeAddress } from './safeAddressUtils';
import type {
    IGetSafeBalancesParams,
    IGetSafeDaoProposalParams,
    IGetSafeDaoProposalsParams,
    IGetSafeInfoParams,
    IGetSafePendingTransactionsParams,
    IGetSafeStoredTransactionsParams,
    IGetSafeTransactionActionsParams,
    IGetSafeTransactionHistoryParams,
} from './safeService.api';

export enum SafeServiceKey {
    SAFE_INFO = 'SAFE_INFO',
    SAFE_PENDING_TRANSACTIONS = 'SAFE_PENDING_TRANSACTIONS',
    SAFE_TRANSACTION_HISTORY = 'SAFE_TRANSACTION_HISTORY',
    SAFE_STORED_TRANSACTIONS = 'SAFE_STORED_TRANSACTIONS',
    SAFE_TRANSACTION_ACTIONS = 'SAFE_TRANSACTION_ACTIONS',
    SAFE_BALANCES = 'SAFE_BALANCES',
    SAFE_DAO_PROPOSALS = 'SAFE_DAO_PROPOSALS',
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

const withSafeHash = <
    TParams extends { urlParams: { address: string; safeTxHash: string } },
>(
    params: TParams,
): TParams => {
    const normalized = withChecksummedAddress(params);

    return {
        ...normalized,
        urlParams: {
            ...normalized.urlParams,
            safeTxHash: params.urlParams.safeTxHash.toLowerCase(),
        },
    };
};

const checksumOptionalAddress = (address: string): string =>
    address === '' ? address : checksumSafeAddress(address);

const safeDaoProposalIdentity = (params: IGetSafeDaoProposalsParams) => ({
    network: params.network,
    safeAddress: checksumOptionalAddress(params.safeAddress),
    daoAddress: checksumOptionalAddress(params.daoAddress),
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
    safeTransactionHistory: (params: IGetSafeTransactionHistoryParams) => [
        SafeServiceKey.SAFE_TRANSACTION_HISTORY,
        apiVersionUtils.getApiVersion(),
        withChecksummedAddress(params),
    ],
    safeStoredTransactions: (params: IGetSafeStoredTransactionsParams) => [
        SafeServiceKey.SAFE_STORED_TRANSACTIONS,
        apiVersionUtils.getApiVersion(),
        withChecksummedAddress(params),
    ],
    safeTransactionActions: (params: IGetSafeTransactionActionsParams) => [
        SafeServiceKey.SAFE_TRANSACTION_ACTIONS,
        apiVersionUtils.getApiVersion(),
        withSafeHash(params),
    ],
    safeBalances: (params: IGetSafeBalancesParams) => [
        SafeServiceKey.SAFE_BALANCES,
        apiVersionUtils.getApiVersion(),
        withChecksummedAddress(params),
    ],
    safeDaoProposals: (params: IGetSafeDaoProposalsParams) => [
        SafeServiceKey.SAFE_DAO_PROPOSALS,
        apiVersionUtils.getApiVersion(),
        { scope: 'list', ...safeDaoProposalIdentity(params) },
    ],
    safeDaoProposal: (params: IGetSafeDaoProposalParams) => [
        SafeServiceKey.SAFE_DAO_PROPOSALS,
        apiVersionUtils.getApiVersion(),
        {
            scope: 'detail',
            ...safeDaoProposalIdentity(params),
            safeTxHash: params.safeTxHash.toLowerCase(),
            state: params.state ?? 'default',
        },
    ],
};
