'use client';

import {
    AssetDataListItem,
    DataListContainer,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import { useSafeBalances } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { safeDataListUtils } from '../../utils/safeDataListUtils';
import { SafeBalanceListItem } from './safeBalanceListItem';

const balancesPerPage = 6;

export interface ISafeBalanceListProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
}

export const SafeBalanceList: React.FC<ISafeBalanceListProps> = (props) => {
    const { network, address } = props;

    const { t } = useTranslations();

    const {
        data: balances,
        isError,
        isLoading,
    } = useSafeBalances({ urlParams: { network, address } });

    const balanceList = balances ?? [];
    const state = safeDataListUtils.getDataListState({ isError, isLoading });

    return (
        <DataListRoot
            entityLabel={t('app.safe.safeBalanceList.entity')}
            itemsCount={balanceList.length}
            pageSize={balancesPerPage}
            state={state}
        >
            <DataListContainer
                emptyState={{
                    heading: t('app.safe.safeBalanceList.empty.heading'),
                    description: t(
                        'app.safe.safeBalanceList.empty.description',
                    ),
                    objectIllustration: { object: 'WALLET' },
                }}
                errorState={{
                    heading: t('app.safe.safeBalanceList.error.heading'),
                    description: t(
                        'app.safe.safeBalanceList.error.description',
                    ),
                    objectIllustration: { object: 'ERROR' },
                }}
                SkeletonElement={AssetDataListItem.Skeleton}
            >
                {balanceList.map((balance) => (
                    <SafeBalanceListItem
                        balance={balance}
                        key={balance.tokenAddress ?? network}
                        network={network}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
