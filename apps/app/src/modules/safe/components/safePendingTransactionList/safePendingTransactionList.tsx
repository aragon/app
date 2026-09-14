'use client';

import {
    AlertInline,
    ChainEntityType,
    DataListContainer,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
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
}

export const SafePendingTransactionList: React.FC<
    ISafePendingTransactionListProps
> = (props) => {
    const { network, address, currentNonce, chainId, safeVersion } = props;

    const { t } = useTranslations();
    const [executionOutcome, setExecutionOutcome] =
        useState<ISafeExecutionActionOutcome>();
    const { buildEntityUrl } = useDaoChain({ network });

    const {
        data: pendingTransactions,
        isError,
        isLoading,
    } = useSafePendingTransactions({ urlParams: { network, address } });
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

    // Unexecuted transactions below the current nonce are permanently dead, so they are never shown.
    const transactions =
        currentNonce == null
            ? []
            : (pendingTransactions?.results ?? []).filter(
                  (transaction) =>
                      BigInt(transaction.nonce) >= BigInt(currentNonce),
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
                </div>
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
                            key={transaction.safeTxHash}
                            network={network}
                            onExecutionOutcome={setExecutionOutcome}
                            safeAddress={address}
                            safeVersion={safeVersion ?? null}
                            transaction={transaction}
                        />
                    ))}
                </DataListContainer>
                <DataListPagination />
            </DataListRoot>
        </>
    );
};
