'use client';

import {
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
}

export const SafePendingTransactionList: React.FC<
    ISafePendingTransactionListProps
> = (props) => {
    const { network, address, currentNonce } = props;

    const { t } = useTranslations();

    const {
        data: pendingTransactions,
        isError,
        isLoading,
    } = useSafePendingTransactions({ urlParams: { network, address } });

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
                        key={transaction.safeTxHash}
                        transaction={transaction}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
