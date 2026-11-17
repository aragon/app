import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { HttpService } from '../httpService';
import { isSafeBalance, SafeServiceErrorCode } from './domain';
import { checksumSafeAddress } from './safeAddressUtils';
import type {
    IConfirmSafeTransactionParams,
    IGetSafeBalancesParams,
    IGetSafesByOwnerParams,
    IProposeSafeTransactionParams,
    ISafeUrlParams,
} from './safeService.api';
import { SafeServiceError } from './safeServiceError';

/**
 * The remaining direct path to the Safe transaction service, through the `/api/safe` proxy.
 *
 * Reads for a governance body moved to Aragon's backend (`safeService`). What is left is what the
 * backend does not serve:
 *
 * - **writes** — proposing and confirming carry a per-owner signature, so they are pass-through by
 *   nature and must never be cached;
 * - **balances** — `/v2/assets` indexes DAO addresses rather than arbitrary Safes, so the Safe
 *   account page still reads balances from the Safe transaction service.
 *
 * This file, the `/api/safe` route and `proxySafeUtils` are deleted together once balances and
 * signature-bearing writes have backend endpoints.
 */
class SafeTransactionService extends HttpService {
    private basePaths = {
        safeBalances: '/:chainId/v1/safes/:address/balances',
        safesByOwner: '/:chainId/v1/owners/:address/safes',
        proposeSafeTransaction:
            '/:chainId/v1/safes/:address/multisig-transactions',
        confirmSafeTransaction:
            '/:chainId/v1/multisig-transactions/:safeTxHash/confirmations',
    };

    constructor() {
        super('/api/safe', SafeServiceError.fromResponse);
    }

    getSafeBalances = async ({ urlParams }: IGetSafeBalancesParams) => {
        const response = await this.request<unknown>(
            this.basePaths.safeBalances,
            { urlParams: this.buildUrlParams(urlParams) },
        );

        if (!Array.isArray(response) || !response.every(isSafeBalance)) {
            throw new SafeServiceError(
                SafeServiceErrorCode.INVALID_RESPONSE,
                'Safe balances response did not match the expected contract',
                502,
            );
        }

        return response;
    };

    /**
     * Addresses of the Safes the given address signs for (an owner, to the Safe API) on the given network.
     */
    getSafesByOwner = async ({
        urlParams,
    }: IGetSafesByOwnerParams): Promise<string[]> => {
        const response = await this.request<unknown>(
            this.basePaths.safesByOwner,
            { urlParams: this.buildUrlParams(urlParams) },
        );
        const safes = (response as { safes?: unknown } | null)?.safes;

        const isValidResponse =
            Array.isArray(safes) &&
            safes.every((safe) => typeof safe === 'string');

        if (!isValidResponse) {
            throw new SafeServiceError(
                SafeServiceErrorCode.INVALID_RESPONSE,
                'Safes by owner response did not match the expected contract',
                502,
            );
        }

        return safes;
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

    private buildUrlParams = ({ network, address }: ISafeUrlParams) => ({
        chainId: networkDefinitions[network].id.toString(),
        address: checksumSafeAddress(address),
    });
}

export const safeTransactionService = new SafeTransactionService();
