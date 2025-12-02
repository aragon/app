'use client';

import { useTransactionList } from '@/modules/finance/api/financeService';
import { DaoInfoAside } from '@/modules/finance/components/daoInfoAside';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import { subDaoDisplayUtils } from '@/shared/utils/subDaoDisplayUtils';
import { DateFormat, formatterUtils, invariant, NumberFormat } from '@aragon/gov-ui-kit';
import type { IGetTransactionListParams } from '../../api/financeService';
import { TransactionList, transactionListFilterParam } from '../../components/transactionList';
import { TransactionListStats } from '../../components/transactionListStats';

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

    const useDaoParams = { id };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const { activePlugin, setActivePlugin } = useDaoPluginFilterUrlParam({
        daoId: id,
        type: PluginType.PROCESS,
        includeSubPlugins: true,
        includeGroupFilter: true,
        name: transactionListFilterParam,
    });

    invariant(activePlugin != null, 'DaoTransactionsPageClient: no valid plugin found.');

    const allTransactionsSelected = activePlugin.uniqueId === 'all';
    const asideCardTitle = subDaoDisplayUtils.getPluginDisplayName({
        dao,
        plugin: activePlugin.meta,
        groupLabel: t('app.finance.daoTransactionsPage.aside.summary'),
        fallbackLabel: activePlugin.label,
    });

    const matchingSubDao = subDaoDisplayUtils.getMatchingSubDao({ dao, plugin: activePlugin.meta });
    const isParentSelected = subDaoDisplayUtils.isParentPlugin({ dao, plugin: activePlugin.meta });
    const selectedDao = !allTransactionsSelected ? (isParentSelected ? dao : (matchingSubDao ?? dao)) : dao;
    const selectedDaoId = selectedDao?.id ?? dao?.id ?? id;

    const { data: allTransactionsMetadata } = useTransactionList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: id,
            },
        },
        { enabled: allTransactionsSelected },
    );

    const totalTransactions = allTransactionsMetadata?.pages[0]?.metadata?.totalRecords;
    const lastActivityTimestamp = allTransactionsMetadata?.pages[0]?.data?.[0]?.blockTimestamp;

    const { data: selectedTransactionsMetadata } = useTransactionList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: selectedDaoId,
                onlyParent: isParentSelected,
            },
        },
        { enabled: !allTransactionsSelected },
    );

    const selectedTotalTransactions = selectedTransactionsMetadata?.pages[0]?.metadata?.totalRecords;
    const selectedLastActivityTimestamp = selectedTransactionsMetadata?.pages[0]?.data?.[0]?.blockTimestamp;

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
                <TransactionList.Container
                    initialParams={initialParams}
                    daoId={id}
                    onValueChange={setActivePlugin}
                    value={activePlugin}
                />
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={asideCardTitle}>
                    {dao && allTransactionsSelected && (
                        <TransactionListStats
                            dao={dao}
                            totalTransactions={totalTransactions}
                            lastActivityTimestamp={lastActivityTimestamp}
                        />
                    )}
                    {dao && !allTransactionsSelected && (
                        <DaoInfoAside
                            plugin={activePlugin.meta}
                            network={dao.network}
                            daoId={id}
                            subDao={matchingSubDao}
                            dao={dao}
                            stats={daoStats}
                        />
                    )}
                </Page.AsideCard>
            </Page.Aside>
        </Page.Content>
    );
};
