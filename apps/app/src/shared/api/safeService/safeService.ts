import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { HttpService } from '../httpService';
import type {
    ISafeBalance,
    ISafeInfo,
    ISafeMultisigTransaction,
    ISafePaginatedResponse,
} from './domain';
import type {
    IGetSafeBalancesParams,
    IGetSafeInfoParams,
    IGetSafePendingTransactionsParams,
    ISafeUrlParams,
} from './safeService.api';
import { SafeServiceError } from './safeServiceError';

/**
 * Reads Safe state through the `/api/safe` proxy route, which injects the Safe API key server-side.
 * The base URL is relative, so these calls run in the browser (or in a route handler on the same
 * origin) — the key is never read here.
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
    };

    constructor() {
        super('/api/safe', SafeServiceError.fromResponse);
    }

    getSafeInfo = async ({ urlParams }: IGetSafeInfoParams) => {
        const result = await this.request<ISafeInfo>(this.basePaths.safeInfo, {
            urlParams: this.buildUrlParams(urlParams),
        });

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

        const result = await this.request<
            ISafePaginatedResponse<ISafeMultisigTransaction>
        >(this.basePaths.safePendingTransactions, {
            urlParams: this.buildUrlParams(urlParams),
            queryParams: {
                executed: false,
                nonce__gte: currentNonce,
                limit,
                offset,
            },
        });

        return result;
    };

    getSafeBalances = async ({ urlParams }: IGetSafeBalancesParams) => {
        const result = await this.request<ISafeBalance[]>(
            this.basePaths.safeBalances,
            { urlParams: this.buildUrlParams(urlParams) },
        );

        return result;
    };

    private buildUrlParams = ({ network, address }: ISafeUrlParams) => ({
        chainId: networkDefinitions[network].id.toString(),
        address,
    });
}

export const safeService = new SafeService();
