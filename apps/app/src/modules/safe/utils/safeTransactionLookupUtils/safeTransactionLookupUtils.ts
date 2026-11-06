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
     * Finds a Safe transaction by its hash, reading the queue first and the history after it. Both are read fresh
     * rather than from the query cache, as the result backs a signature or an execution.
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
