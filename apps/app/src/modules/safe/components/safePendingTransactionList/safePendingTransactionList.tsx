'use client';

import {
    AlertInline,
    ChainEntityType,
    DataListContainer,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { safeAppTransactionUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import type { Network } from '@/shared/api/daoService';
import {
    type ISafeInfo,
    useSafePendingTransactions,
} from '@/shared/api/safeService';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import type { ISafeExecutionActionOutcome } from '../../hooks/useSafeTransactionActions';
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
     * Chain the Safe is deployed on, used to sign confirmations for the right network.
     */
    chainId: number;
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
    const { network, address, currentNonce, chainId, safeVersion, threshold } =
        props;

    const { t } = useTranslations();
    const [executionOutcome, setExecutionOutcome] =
        useState<ISafeExecutionActionOutcome>();
    const { buildEntityUrl } = useDaoChain({ network });
    /**
     * A proposal body card links here with the `safeTxHash` it was showing, so one transaction
     * resolves to one review payload on both surfaces (W4's handoff). The row is named, never
     * auto-opened: a URL that pops a signing review is an affordance this surface must not hand
     * to whoever wrote the link. Nothing here says the transaction affects that proposal - this
     * view answers the Safe's nonce sequence and nothing else.
     */
    const followedTxHash = useSearchParams().get('tx')?.toLowerCase();

    const {
        data: pendingTransactions,
        isError,
        isLoading,
    } = useSafePendingTransactions(
        { urlParams: { network, address } },
        // A post-signature refetch can still see the backend's previous snapshot.
        // Keep the open account view current, including confirmations from other owners.
        { refetchInterval: 30_000 },
    );
    const outcomeMessageKey =
        executionOutcome == null
            ? undefined
            : executionOutcome.status === 'executed'
              ? 'executed'
              : executionOutcome.messageKey;
    const executionHashLink =
        executionOutcome?.hash == null
            ? undefined
            : buildEntityUrl({
                  type: ChainEntityType.TRANSACTION,
                  id: executionOutcome.hash,
              });
    // Two different identities for one attempt: the explorer needs the execution transaction's
    // hash, the Safe app addresses the queued transaction by its `safeTxHash`. Both are carried on
    // the outcome so neither has to be derived from the other. Undefined on a network with no Safe
    // short name.
    const safeTransactionLink =
        executionOutcome?.safeTxHash == null
            ? undefined
            : safeAppTransactionUrl({
                  network,
                  address,
                  safeTxHash: executionOutcome.safeTxHash,
              });

    // Unexecuted transactions below the current nonce are permanently dead, so they are never shown.
    const transactions =
        currentNonce == null
            ? []
            : (pendingTransactions?.results ?? []).filter(
                  (transaction) =>
                      BigInt(transaction.nonce) >= BigInt(currentNonce),
              );
    // Two live transactions can share a nonce - the service accepts it, and only one of them can
    // ever execute. The governance card already discloses this; the account queue rendered them as
    // two independent, equally signable rows.
    const contestedNonces = new Set(
        transactions
            .map(({ nonce }) => nonce)
            .filter((nonce, index, all) => all.indexOf(nonce) !== index),
    );
    // Followed here but absent from the live queue: it executed, was replaced at its nonce, or the
    // link is stale. Saying so beats a page that silently shows a queue without it.
    const isFollowedMissing =
        followedTxHash != null &&
        !isLoading &&
        !transactions.some(
            ({ safeTxHash }) => safeTxHash.toLowerCase() === followedTxHash,
        );
    const state = safeDataListUtils.getDataListState({
        isError,
        isLoading: isLoading || currentNonce == null,
    });

    return (
        <>
            {outcomeMessageKey != null && (
                <div className="mb-4 flex flex-col items-start gap-2">
                    <AlertInline
                        message={t(
                            `app.safe.safePendingTransactionList.execution.${outcomeMessageKey}`,
                        )}
                        variant={
                            executionOutcome?.status === 'executed'
                                ? 'success'
                                : 'critical'
                        }
                    />
                    {executionHashLink != null && (
                        <Link href={executionHashLink} target="_blank">
                            {t(
                                'app.safe.safePendingTransactionList.execution.transactionHash',
                            )}
                        </Link>
                    )}
                    {safeTransactionLink != null && (
                        <Link href={safeTransactionLink} target="_blank">
                            {t(
                                'app.safe.safePendingTransactionList.execution.safeTransaction',
                            )}
                        </Link>
                    )}
                </div>
            )}
            {pendingTransactions?.meta.stale === true && (
                <AlertInline
                    className="mb-4"
                    message={t('app.safe.safePendingTransactionList.stale')}
                    variant="warning"
                />
            )}
            {isFollowedMissing && (
                <AlertInline
                    className="mb-4"
                    message={t(
                        'app.safe.safePendingTransactionList.followedMissing',
                    )}
                    variant="info"
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
                            chainId={chainId}
                            currentNonce={currentNonce}
                            hasNonceRival={contestedNonces.has(
                                transaction.nonce,
                            )}
                            isFollowed={
                                transaction.safeTxHash.toLowerCase() ===
                                followedTxHash
                            }
                            key={transaction.safeTxHash}
                            network={network}
                            onExecutionOutcome={setExecutionOutcome}
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
