'use client';

import { useAssetList, useTransactionList } from '@/modules/finance/api/financeService';
import { DaoFilterAsideCard } from '@/modules/finance/components/daoFilterAsideCard';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { IGetTransactionListParams } from '../../api/financeService';
import { TransactionList, transactionListFilterParam } from '../../components/transactionList';

export interface IDaoTransactionsPageClientProps {
    /**
     * ID of the DAO.
     */
    id: string;
    /**
     * Initial parameters to use to fetch the DAO transactions list.
     */
    initialParams: NestedOmit<IGetTransactionListParams, 'queryParams.address'>;
}

export const DaoTransactionsPageClient: React.FC<IDaoTransactionsPageClientProps> = (props) => {
    const { id, initialParams } = props;
    const { t } = useTranslations();

    const { activeOption } = useDaoFilterUrlParam({
        daoId: id,
        includeAllOption: true,
        name: transactionListFilterParam,
    });

    const { data: dao } = useDao({
        urlParams: { id },
        queryParams: { onlyParent: activeOption?.onlyParent },
    });

    const allTransactionsSelected = activeOption?.isAll ?? false;
    const selectedDaoId = activeOption?.daoId ?? id;

    // Fetch assets for "All" view
    const { data: allAssetsMetadata } = useAssetList(
        {
            queryParams: {
                daoId: id,
            },
        },
        { enabled: allTransactionsSelected },
    );

    // Fetch transactions for selected DAO view
    const { data: selectedTransactionsMetadata } = useTransactionList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: selectedDaoId,
                onlyParent: activeOption?.onlyParent,
            },
        },
        { enabled: !allTransactionsSelected },
    );

    if (dao == null) {
        return null;
    }

    return (
        <Page.Content>
            <Page.Main title={t('app.finance.daoTransactionsPage.main.title')}>
                <TransactionList.Container initialParams={initialParams} daoId={id} />
            </Page.Main>
            <Page.Aside>
                <DaoFilterAsideCard
                    dao={dao}
                    filterParamName={transactionListFilterParam}
                    selectedMetadata={selectedTransactionsMetadata?.pages[0]}
                    allMetadata={allAssetsMetadata?.pages[0]}
                    statsType="transactions"
                />
            </Page.Aside>
        </Page.Content>
    );
};
