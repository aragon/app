import { safeQueueReadLimit } from '@/plugins/safeMultisigPlugin/constants';
import type { Network } from '@/shared/api/daoService';
import {
    type ISafeMultisigTransaction,
    safeService,
} from '@/shared/api/safeService';

export interface IFindSafeTransactionParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
    /**
     * Hash of the Safe transaction to find.
     */
    safeTxHash: string;
}

class SafeTransactionLookupUtils {
    /**
     * Finds a Safe transaction by its hash, reading the queue first and the history after it. Both bypass the query
     * cache, as the result backs a signature or an execution, but not the backend cache: the queue can lag ~10 s and
     * the history up to 10 min, so a transaction just executed can be missing from both. Owners, threshold and nonce
     * are read onchain by the callers, and the transaction fields are checked against the reviewed hash.
     */
    findTransaction = async (
        params: IFindSafeTransactionParams,
    ): Promise<ISafeMultisigTransaction | undefined> => {
        const { network, address, safeTxHash } = params;
        const urlParams = { network, address };

        const queued = await safeService.getSafePendingTransaction({
            urlParams: { ...urlParams, safeTxHash },
            queryParams: { limit: safeQueueReadLimit },
        });

        if (queued != null) {
            return queued;
        }

        let offset = 0;

        for (;;) {
            const page = await safeService.getSafeTransactionHistory({
                urlParams,
                queryParams: { limit: safeQueueReadLimit, offset },
            });
            const transaction = page.results.find(
                (item) =>
                    item.safeTxHash.toLowerCase() === safeTxHash.toLowerCase(),
            );

            if (transaction != null) {
                return transaction;
            }

            if (page.next == null || page.results.length === 0) {
                return undefined;
            }

            offset += page.results.length;
        }
    };
}

export const safeTransactionLookupUtils = new SafeTransactionLookupUtils();
