import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { HttpService } from '../httpService';
import type { ISafeInfo, ISafeMultisigTransaction } from './domain';
import {
    isSafeBalance,
    isSafeInfo,
    isSafeMultisigTransaction,
    isSafePaginatedResponse,
    SafeServiceErrorCode,
} from './domain';
import { checksumSafeAddress } from './safeAddressUtils';
import { safeFreshReadHeader } from './safeQueryConfig';
import type {
    IConfirmSafeTransactionParams,
    IGetSafeBalancesParams,
    IGetSafeInfoParams,
    IGetSafeNextNonceParams,
    IGetSafePendingTransactionsParams,
    IProposeSafeTransactionParams,
    ISafeUrlParams,
} from './safeService.api';
import { SafeServiceError } from './safeServiceError';

/**
 * Reads Safe state through the `/api/safe` proxy route, which injects the Safe API key server-side.
 * The relative base URL sends browser requests to that same-origin route; the key is never read
 * here.
 *
 * Failures surface as a `SafeServiceError` carrying a `SafeServiceErrorCode`, so an unsupported
 * chain or an exhausted quota stays distinguishable from a genuine error.
 */
class SafeService extends HttpService {
    private basePaths = {
        safeInfo: '/:chainId/v1/safes/:address',
        safePendingTransactions:
            '/:chainId/v2/safes/:address/multisig-transactions',
        safeBalances: '/:chainId/v1/safes/:address/balances',
        proposeSafeTransaction:
            '/:chainId/v1/safes/:address/multisig-transactions',
        confirmSafeTransaction:
            '/:chainId/v1/multisig-transactions/:safeTxHash/confirmations',
    };

    constructor() {
        super('/api/safe', SafeServiceError.fromResponse);
    }

    getSafeInfo = async ({ urlParams }: IGetSafeInfoParams) => {
        const response = await this.request<unknown>(this.basePaths.safeInfo, {
            urlParams: this.buildUrlParams(urlParams),
        });
        const result = this.normalizeSafeInfo(response);

        if (result == null) {
            return this.throwInvalidResponse('Safe info');
        }

        return result;
    };

    /**
     * Fetches the live queue of a Safe: unexecuted transactions whose nonce can still be reached.
     * `executed=false` alone is not enough — transactions below the current nonce are permanently
     * dead and must never be shown as pending.
     */
    getSafePendingTransactions = async ({
        urlParams,
        queryParams,
    }: IGetSafePendingTransactionsParams) => {
        const { currentNonce, limit, offset } = queryParams;

        const response = await this.request<unknown>(
            this.basePaths.safePendingTransactions,
            {
                urlParams: this.buildUrlParams(urlParams),
                queryParams: {
                    executed: false,
                    nonce__gte: currentNonce,
                    limit,
                    offset,
                },
            },
        );

        if (
            !isSafePaginatedResponse(
                response,
                (_item: unknown): _item is unknown => true,
            )
        ) {
            return this.throwInvalidResponse('Safe pending transactions');
        }

        const results: ISafeMultisigTransaction[] = [];

        for (const transaction of response.results) {
            const normalizedTransaction =
                this.normalizeSafeMultisigTransaction(transaction);

            if (normalizedTransaction == null) {
                return this.throwInvalidResponse('Safe pending transactions');
            }

            results.push(normalizedTransaction);
        }

        return { ...response, results };
    };

    /**
     * Resolves the nonce a new transaction must occupy: one past the highest nonce any queued
     * transaction already holds, floored at the Safe's live onchain nonce.
     *
     * Proposing at the current nonce instead makes the new transaction *compete* with whatever
     * already sits there. Nothing is overwritten in the service — both survive — but executing
     * either one permanently invalidates the rest, which is how a queued report silently dies.
     *
     * Both inputs are read here, fresh, and marked uncacheable. Neither may come from a polled or
     * cached source: the nonce is bound into the EIP-712 `safeTxHash` and cannot be changed once
     * signatures exist, so a stale queue allocates a colliding nonce and a stale onchain nonce
     * allocates an already-consumed one — a transaction born unexecutable.
     *
     * The maximum is recomputed rather than trusting row order: the transaction service answers 200
     * and silently ignores an ordering it does not recognise, so a future rename of the field would
     * degrade into a wrong nonce instead of an error.
     */
    getSafeNextNonce = async ({ urlParams }: IGetSafeNextNonceParams) => {
        const requestUrlParams = this.buildUrlParams(urlParams);
        const freshRead = { headers: { [safeFreshReadHeader]: '1' } };

        const [safeInfoResponse, queueResponse] = await Promise.all([
            this.request<unknown>(
                this.basePaths.safeInfo,
                { urlParams: requestUrlParams },
                freshRead,
            ),
            this.request<unknown>(
                this.basePaths.safePendingTransactions,
                {
                    urlParams: requestUrlParams,
                    queryParams: {
                        executed: false,
                        ordering: '-nonce',
                        limit: 1,
                    },
                },
                freshRead,
            ),
        ]);

        const safeInfo = this.normalizeSafeInfo(safeInfoResponse);

        if (safeInfo == null) {
            return this.throwInvalidResponse('Safe next nonce');
        }

        if (
            !isSafePaginatedResponse(
                queueResponse,
                (_item: unknown): _item is unknown => true,
            )
        ) {
            return this.throwInvalidResponse('Safe next nonce');
        }

        let nextNonce = BigInt(safeInfo.nonce);

        for (const transaction of queueResponse.results) {
            const normalizedTransaction =
                this.normalizeSafeMultisigTransaction(transaction);

            if (normalizedTransaction == null) {
                return this.throwInvalidResponse('Safe next nonce');
            }

            const candidate = BigInt(normalizedTransaction.nonce) + BigInt(1);

            if (candidate > nextNonce) {
                nextNonce = candidate;
            }
        }

        return nextNonce.toString();
    };

    getSafeBalances = async ({ urlParams }: IGetSafeBalancesParams) => {
        const response = await this.request<unknown>(
            this.basePaths.safeBalances,
            { urlParams: this.buildUrlParams(urlParams) },
        );

        if (!Array.isArray(response) || !response.every(isSafeBalance)) {
            return this.throwInvalidResponse('Safe balances');
        }

        return response;
    };

    proposeSafeTransaction = ({
        urlParams,
        body,
    }: IProposeSafeTransactionParams) => {
        const {
            safeTransactionData,
            safeTxHash,
            senderAddress,
            senderSignature,
            origin,
        } = body;

        // The transaction service expects the Safe transaction fields flattened at the top level
        // with its own field names (contractTransactionHash / sender / signature), not the nested
        // domain shape. Sending the domain shape verbatim is rejected with 422.
        const wireBody = {
            ...safeTransactionData,
            contractTransactionHash: safeTxHash,
            sender: senderAddress,
            signature: senderSignature,
            origin,
        };

        return this.request<unknown>(
            this.basePaths.proposeSafeTransaction,
            { urlParams: this.buildUrlParams(urlParams), body: wireBody },
            { method: 'POST' },
        );
    };

    confirmSafeTransaction = async ({
        urlParams,
        body,
    }: IConfirmSafeTransactionParams) =>
        this.request<unknown>(
            this.basePaths.confirmSafeTransaction,
            {
                urlParams: {
                    chainId:
                        networkDefinitions[urlParams.network].id.toString(),
                    safeTxHash: urlParams.safeTxHash,
                },
                body,
            },
            { method: 'POST' },
        );

    private normalizeSafeInfo = (value: unknown): ISafeInfo | undefined => {
        if (value == null || typeof value !== 'object') {
            return undefined;
        }

        const { nonce, ...safeInfo } = value as Record<string, unknown>;

        if (typeof nonce !== 'string' && typeof nonce !== 'number') {
            return undefined;
        }

        const normalized = { ...safeInfo, nonce: String(nonce) };

        return isSafeInfo(normalized) ? normalized : undefined;
    };

    /**
     * The transaction service calls the proposing owner `proposer`; the app's Safe domain calls
     * that address `from`. Normalize at the service boundary so consumers never depend on the
     * upstream naming, and keep nonces as decimal strings to avoid uint256 precision loss.
     */
    private normalizeSafeMultisigTransaction = (
        value: unknown,
    ): ISafeMultisigTransaction | undefined => {
        if (value == null || typeof value !== 'object') {
            return undefined;
        }

        const { nonce, proposer, ...transaction } = value as Record<
            string,
            unknown
        >;

        if (
            (typeof nonce !== 'string' && typeof nonce !== 'number') ||
            (typeof proposer !== 'string' && proposer !== null)
        ) {
            return undefined;
        }

        const normalized = {
            ...transaction,
            nonce: String(nonce),
            from: proposer,
        };

        return isSafeMultisigTransaction(normalized) ? normalized : undefined;
    };

    private throwInvalidResponse = (resource: string): never => {
        throw new SafeServiceError(
            SafeServiceErrorCode.INVALID_RESPONSE,
            `${resource} response did not match the expected contract`,
            502,
        );
    };

    /**
     * The canonical address form is enforced here as well as in the query keys: an imperative
     * caller (`getSafeNextNonce`) has no key to go through, and a request built from an
     * unchecksummed address is answered with 422.
     */
    private buildUrlParams = ({ network, address }: ISafeUrlParams) => ({
        chainId: networkDefinitions[network].id.toString(),
        address: checksumSafeAddress(address),
    });
}

export const safeService = new SafeService();
