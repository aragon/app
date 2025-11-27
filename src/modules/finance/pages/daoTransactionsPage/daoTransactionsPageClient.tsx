'use client';

import { TransactionListStats } from '@/modules/finance/components/transactionListStats';
import { TransactionSubDaoInfo } from '@/modules/finance/components/transactionSubDaoInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import { invariant } from '@aragon/gov-ui-kit';
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

    const useDaoParams = { id };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const { activePlugin, setActivePlugin } = useDaoPluginFilterUrlParam({
        daoId: id,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeGroupFilter: true,
        name: transactionListFilterParam,
    });

    invariant(activePlugin != null, 'DaoTransactionsPageClient: no valid plugin found.');

    const allTransactionsSelected = activePlugin.uniqueId === 'all';
    const asideCardTitle = allTransactionsSelected
        ? t('app.finance.daoTransactionsPage.aside.treasury')
        : activePlugin.label;

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
                    {dao && allTransactionsSelected && <TransactionListStats dao={dao} />}
                    {dao && !allTransactionsSelected && (
                        <TransactionSubDaoInfo plugin={activePlugin.meta} network={dao.network} daoId={id} />
                    )}
                </Page.AsideCard>
            </Page.Aside>
        </Page.Content>
    );
};
