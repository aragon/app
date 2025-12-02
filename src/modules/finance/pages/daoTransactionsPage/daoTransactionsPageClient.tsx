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
import { formatterUtils, invariant, NumberFormat } from '@aragon/gov-ui-kit';
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

    const { data: allTransactionsMetadata } = useTransactionList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: id,
                address: undefined,
                pageSize: 1,
            },
        },
        { enabled: allTransactionsSelected },
    );

    const totalTransactions = allTransactionsMetadata?.pages[0]?.metadata?.totalRecords;
    const lastActivityTimestamp = allTransactionsMetadata?.pages[0]?.data?.[0]?.blockTimestamp;
    const selectedDaoId = matchingSubDao?.id ?? dao?.id;
    const asideMetrics = matchingSubDao?.metrics ?? dao?.metrics;

    const { data: selectedTransactionsMetadata } = useTransactionList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: selectedDaoId,
                pageSize: 1,
            },
        },
        { enabled: !allTransactionsSelected },
    );

    const selectedTotalTransactions = selectedTransactionsMetadata?.pages[0]?.metadata?.totalRecords;
    const daoStats: Array<{ label: string; value: string | number }> =
        asideMetrics != null
            ? ([
                  {
                      label: t('app.finance.transactionSubDaoInfo.value'),
                      value:
                          formatterUtils.formatNumber(asideMetrics.tvlUSD, { format: NumberFormat.FIAT_TOTAL_SHORT }) ??
                          asideMetrics.tvlUSD,
                  },
                  selectedTotalTransactions != null && {
                      label: t('app.finance.transactionSubDaoInfo.transactions'),
                      value:
                          formatterUtils.formatNumber(selectedTotalTransactions, {
                              format: NumberFormat.GENERIC_SHORT,
                          }) ?? selectedTotalTransactions,
                  },
              ].filter(Boolean) as Array<{ label: string; value: string | number }>)
            : [];

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
