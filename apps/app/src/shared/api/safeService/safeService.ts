import { AragonBackendService } from '../aragonBackendService';
import type { ISafeMeta } from './domain';
import {
    isSafeInfo,
    isSafeMeta,
    isSafeMultisigTransaction,
    isSafeNextNonce,
    isSafePaginatedResponse,
    isSafeStoredTransactionsResponse,
    isSafeTransactionActions,
    SafeServiceErrorCode,
} from './domain';
import { checksumSafeAddress } from './safeAddressUtils';
import type {
    IGetSafeInfoParams,
    IGetSafeNextNonceParams,
    IGetSafePendingTransactionsParams,
    IGetSafeStoredTransactionsParams,
    IGetSafeTransactionActionsParams,
    IGetSafeTransactionHistoryParams,
    ISafeTransactionUrlParams,
    ISafeUrlParams,
} from './safeService.api';
import { SafeServiceError } from './safeServiceError';

/**
 * Reads Safe state through Aragon's own backend at `/v2/safe/*`, not from the Safe transaction
 * service directly.
 *
 * The backend owns everything the app used to: the API key, a shared cache that collapses every
 * viewer of a Safe into one upstream call, an hourly spend budget, and the rule that nonce
 * allocation never touches a cache. `info` is served from contract reads and costs no Safe quota at
 * all.
 *
 * Failures keep the `SafeServiceErrorCode` vocabulary, so an unsupported chain or an exhausted quota
 * stays distinguishable from a genuine error.
 */
class SafeService extends AragonBackendService {
    private urls = {
        safeInfo: '/v2/safe/:network/:address/info',
        safeQueue: '/v2/safe/:network/:address/queue',
        safeNextNonce: '/v2/safe/:network/:address/next-nonce',
        safeHistory: '/v2/safe/:network/:address/history',
        safeStoredTransactions: '/v2/safe/:network/:address/transactions',
        safeTransactionActions:
            '/v2/safe/:network/:address/transactions/:safeTxHash/actions',
    };

    constructor() {
        super(SafeServiceError.fromResponse);
    }

    getSafeInfo = async ({ urlParams }: IGetSafeInfoParams) => {
        const response = await this.request<unknown>(this.urls.safeInfo, {
            urlParams: this.buildUrlParams(urlParams),
        });

        if (!isSafeInfo(response) || !this.hasMeta(response)) {
            return this.throwInvalidResponse('Safe info');
        }

        return response;
    };

    /**
     * Reads the unexecuted transactions of a Safe.
     *
     * Deliberately **not** filtered by nonce. Liveness is derived client-side from the nonce the
     * caller already holds: a server-side `nonce__gte` filter would put the current nonce in the
     * cache key on both sides, so every nonce advance would orphan an entry and refetch cold.
     */
    getSafePendingTransactions = async ({
        urlParams,
        queryParams,
    }: IGetSafePendingTransactionsParams) => {
        const response = await this.request<unknown>(this.urls.safeQueue, {
            urlParams: this.buildUrlParams(urlParams),
            queryParams,
        });

        if (
            !isSafePaginatedResponse(response, isSafeMultisigTransaction) ||
            !this.hasMeta(response)
        ) {
            return this.throwInvalidResponse('Safe pending transactions');
        }

        return response;
    };

    /**
     * Reads stored Safe transactions. This is eventual store data for display; write safety still
     * uses the live queue/history reads above.
     */
    getSafeStoredTransactions = async ({
        urlParams,
        queryParams,
    }: IGetSafeStoredTransactionsParams) => {
        const response = await this.request<unknown>(
            this.urls.safeStoredTransactions,
            {
                urlParams: this.buildUrlParams(urlParams),
                queryParams,
            },
        );

        if (!isSafeStoredTransactionsResponse(response)) {
            return this.throwInvalidResponse('Safe stored transactions');
        }

        return response;
    };

    getSafeTransactionActions = async ({
        urlParams,
    }: IGetSafeTransactionActionsParams) => {
        const response = await this.request<unknown>(
            this.urls.safeTransactionActions,
            { urlParams: this.buildTransactionUrlParams(urlParams) },
        );

        if (!isSafeTransactionActions(response)) {
            return this.throwInvalidResponse('Safe transaction actions');
        }

        return response;
    };

    /**
     * Reads the executed transactions of a Safe, newest nonce first.
     *
     * The queue serves unexecuted transactions only, so this is the sole source for a settled
     * report's confirmations, the nonce it consumed and the onchain hash that executed it.
     *
     * Deliberately **not** filtered by `to`: a report batched through MultiSend targets the
     * MultiSend contract, so a target filter would silently miss exactly the out-of-band case this
     * exists to surface. Correlation is done client-side against the decoded calldata.
     */
    getSafeTransactionHistory = async ({
        urlParams,
        queryParams,
    }: IGetSafeTransactionHistoryParams) => {
        const response = await this.request<unknown>(this.urls.safeHistory, {
            urlParams: this.buildUrlParams(urlParams),
            queryParams,
        });

        if (
            !isSafePaginatedResponse(response, isSafeMultisigTransaction) ||
            !this.hasMeta(response)
        ) {
            return this.throwInvalidResponse('Safe transaction history');
        }

        return response;
    };

    /**
     * Resolves the nonce a new transaction must occupy.
     *
     * Takes no `currentNonce`: given one, a caller would eventually be handed a polled value, and a stale
     * floor allocates a nonce the Safe has already consumed. The backend reads both the live onchain
     * nonce and the queue itself, uncached.
     */
    getSafeNextNonce = async ({ urlParams }: IGetSafeNextNonceParams) => {
        const response = await this.request<unknown>(this.urls.safeNextNonce, {
            urlParams: this.buildUrlParams(urlParams),
        });

        if (!isSafeNextNonce(response) || !this.hasMeta(response)) {
            return this.throwInvalidResponse('Safe next nonce');
        }

        return response;
    };

    private hasMeta = <TValue>(
        value: TValue,
    ): value is TValue & { meta: ISafeMeta } =>
        isSafeMeta((value as { meta?: unknown }).meta);

    private throwInvalidResponse = (resource: string): never => {
        throw new SafeServiceError(
            SafeServiceErrorCode.INVALID_RESPONSE,
            `${resource} response did not match the expected contract`,
            502,
        );
    };

    /**
     * The canonical address form is EIP-55 checksummed, enforced here rather than trusted from
     * callers. It is also the cache-key identity in `safeServiceKeys`, so the two must not drift.
     */
    private buildUrlParams = ({ network, address }: ISafeUrlParams) => ({
        network,
        address: checksumSafeAddress(address),
    });

    private buildTransactionUrlParams = ({
        network,
        address,
        safeTxHash,
    }: ISafeTransactionUrlParams) => ({
        ...this.buildUrlParams({ network, address }),
        safeTxHash: safeTxHash.toLowerCase(),
    });
}

export const safeService = new SafeService();
