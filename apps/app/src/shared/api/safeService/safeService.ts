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
import type {
    IConfirmSafeTransactionParams,
    IGetSafeBalancesParams,
    IGetSafeInfoParams,
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

    private buildUrlParams = ({ network, address }: ISafeUrlParams) => ({
        chainId: networkDefinitions[network].id.toString(),
        address,
    });
}

export const safeService = new SafeService();
