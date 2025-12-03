'use client';

import { useAssetList, useTransactionList } from '@/modules/finance/api/financeService';
import { AllAssetsStats } from '@/modules/finance/components/allAssetsStats';
import { DaoInfoAside } from '@/modules/finance/components/daoInfoAside';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import { DateFormat, formatterUtils, invariant, NumberFormat } from '@aragon/gov-ui-kit';
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

    const { data: dao } = useDao({ urlParams: { id } });

    const { activeOption } = useDaoFilterUrlParam({
        daoId: id,
        includeAllOption: true,
        name: transactionListFilterParam,
    });

    invariant(activeOption != null, 'DaoTransactionsPageClient: no valid DAO filter option found.');

    const allTransactionsSelected = activeOption.isAll;
    const asideCardTitle = activeOption.isAll ? t('app.finance.daoTransactionsPage.aside.summary') : activeOption.label;

    // Get the selected DAO (parent or SubDAO)
    const selectedDaoId = activeOption.daoId ?? id;
    const matchingSubDao = dao?.subDaos?.find((subDao) => subDao.id === selectedDaoId);

    const { data: allAssetsMetadata } = useAssetList(
        {
            queryParams: {
                daoId: id,
            },
        },
        { enabled: allTransactionsSelected },
    );

    const { data: selectedTransactionsMetadata } = useTransactionList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: selectedDaoId,
                onlyParent: activeOption.onlyParent,
            },
        },
        { enabled: !allTransactionsSelected },
    );

    const selectedTotalTransactions = selectedTransactionsMetadata?.pages[0]?.metadata?.totalRecords;
    const selectedLastActivityTimestamp = selectedTransactionsMetadata?.pages[0]?.data?.[0]?.blockTimestamp;
    const totalAssets = allAssetsMetadata?.pages[0]?.metadata?.totalRecords;

    const formattedTransactionsCount =
        selectedTotalTransactions != null
            ? (formatterUtils.formatNumber(selectedTotalTransactions, {
                  format: NumberFormat.GENERIC_SHORT,
              }) ?? '-')
            : '-';
    const formattedSelectedLastActivity =
        selectedLastActivityTimestamp != null
            ? (formatterUtils.formatDate(selectedLastActivityTimestamp * 1000, { format: DateFormat.RELATIVE }) ?? '-')
            : '-';

    const daoStats: Array<{ label: string; value: string | number }> = [
        {
            label: t('app.finance.transactionSubDaoInfo.transactions'),
            value: formattedTransactionsCount,
        },
        {
            label: t('app.finance.transactionListStats.lastActivity'),
            value: formattedSelectedLastActivity,
        },
    ];

    return (
        <Page.Content>
            <Page.Main title={t('app.finance.daoTransactionsPage.main.title')}>
                <TransactionList.Container initialParams={initialParams} daoId={id} />
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={asideCardTitle}>
                    {dao && allTransactionsSelected && (
                        <AllAssetsStats dao={dao} totalValueUsd={dao.metrics.tvlUSD} totalAssets={totalAssets} />
                    )}
                    {dao && !allTransactionsSelected && (
                        <DaoInfoAside
                            daoId={selectedDaoId}
                            network={dao.network}
                            dao={dao}
                            subDao={matchingSubDao}
                            stats={daoStats}
                        />
                    )}
                </Page.AsideCard>
            </Page.Aside>
        </Page.Content>
    );
};
