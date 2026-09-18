'use client';

import {
    AlertInline,
    DataListContainer,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import {
    type ISafeInfo,
    useSafePendingTransactions,
} from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { safeDataListUtils } from '../../utils/safeDataListUtils';
import { SafePendingTransactionListItem } from './safePendingTransactionListItem';

const transactionsPerPage = 6;

export interface ISafePendingTransactionListProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
    /**
     * Current nonce of the Safe. The backend returns every unexecuted transaction and does not
     * filter by nonce — a server-side filter would put the nonce in the cache key and orphan an
     * entry on every advance — so liveness is derived here. Undefined until the Safe info resolves.
     */
    currentNonce?: ISafeInfo['nonce'];
    /**
     * Contract version of the Safe, needed to recompute a transaction hash. Undefined until the
     * Safe info resolves.
     */
    safeVersion?: ISafeInfo['version'];
    /**
     * Signing threshold read from the Safe itself. The queue response's own
     * `confirmationsRequired` is service-derived — upstream falls back to the Safe's latest status
     * and then to the indexed confirmation count — and it is not part of the EIP-712 `SafeTx`
     * struct, so no hash comparison can detect a wrong value. The chain threshold is preferred
     * wherever a row states how many signatures a transaction still needs. Undefined until the
     * Safe info resolves.
     */
    threshold?: ISafeInfo['threshold'];
}

export const SafePendingTransactionList: React.FC<
    ISafePendingTransactionListProps
> = (props) => {
    const { network, address, currentNonce, safeVersion, threshold } = props;

    const { t } = useTranslations();

    const {
        data: pendingTransactions,
        isError,
        isLoading,
    } = useSafePendingTransactions(
        { urlParams: { network, address } },
        // Keep the open account view current, including confirmations from other owners.
        { refetchInterval: 30_000 },
    );

    /**
     * Unexecuted transactions below the current nonce are permanently dead, so they are never
     * shown. What is left is rendered in nonce order, ascending: the service answers newest first,
     * which puts the only transaction that can execute now at the bottom — and off the first page
     * entirely once a Safe has more live rows than fit on it. This surface exists to answer the
     * Safe's nonce sequence, so it renders that sequence.
     */
    const transactions =
        currentNonce == null
            ? []
            : (pendingTransactions?.results ?? [])
                  .filter(
                      (transaction) =>
                          BigInt(transaction.nonce) >= BigInt(currentNonce),
                  )
                  .sort((left, right) => {
                      const leftNonce = BigInt(left.nonce);
                      const rightNonce = BigInt(right.nonce);

                      if (leftNonce === rightNonce) {
                          // Same-nonce rivals keep the order the service answered in: neither is
                          // ahead of the other, and an arbitrary swap would read as a ranking.
                          return 0;
                      }

                      return leftNonce < rightNonce ? -1 : 1;
                  });
    // Two live transactions can share a nonce - the service accepts it, and only one of them can
    // ever execute. The governance card already discloses this; the account queue renders them as
    // two independent, equally signable rows.
    const contestedNonces = new Set(
        transactions
            .map(({ nonce }) => nonce)
            .filter((nonce, index, all) => all.indexOf(nonce) !== index),
    );
    const state = safeDataListUtils.getDataListState({
        isError,
        isLoading: isLoading || currentNonce == null,
    });

    return (
        <>
            {pendingTransactions?.meta.stale === true && (
                <AlertInline
                    className="mb-4"
                    message={t('app.safe.safePendingTransactionList.stale')}
                    variant="warning"
                />
            )}
            <DataListRoot
                entityLabel={t('app.safe.safePendingTransactionList.entity')}
                itemsCount={transactions.length}
                pageSize={transactionsPerPage}
                state={state}
            >
                <DataListContainer
                    emptyState={{
                        heading: t(
                            'app.safe.safePendingTransactionList.empty.heading',
                        ),
                        description: t(
                            'app.safe.safePendingTransactionList.empty.description',
                        ),
                        objectIllustration: { object: 'ACTION' },
                    }}
                    errorState={{
                        heading: t(
                            'app.safe.safePendingTransactionList.error.heading',
                        ),
                        description: t(
                            'app.safe.safePendingTransactionList.error.description',
                        ),
                        objectIllustration: { object: 'ERROR' },
                    }}
                >
                    {transactions.map((transaction) => (
                        <SafePendingTransactionListItem
                            currentNonce={currentNonce}
                            hasNonceRival={contestedNonces.has(
                                transaction.nonce,
                            )}
                            key={transaction.safeTxHash}
                            network={network}
                            safeAddress={address}
                            safeVersion={safeVersion ?? null}
                            threshold={threshold}
                            transaction={transaction}
                        />
                    ))}
                </DataListContainer>
                <DataListPagination />
            </DataListRoot>
        </>
    );
};
