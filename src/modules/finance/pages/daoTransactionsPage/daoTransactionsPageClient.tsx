'use client';

import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList';
import { TransactionList } from '@/modules/finance/components/transactionList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IGetTransactionListParams } from '../../api/financeService';

export interface IDaoTransactionsPageClientProps {
    /**
     * DAO page parameters.
     */
    id: string;
    /**
     * Initial parameters to use to fetch the DAO transaction list.
     */
    initialParams: IGetTransactionListParams;
}

export const DaoTransactionsPageClient: React.FC<IDaoTransactionsPageClientProps> = (props) => {
    const { id, initialParams } = props;
    const { t } = useTranslations();

    const useDaoParams = { id };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    return (
        <Page.Content>
            <Page.Main title={t('app.finance.daoTransactionsPage.main.title')}>
                <TransactionList initialParams={initialParams} />
            </Page.Main>
            <Page.Aside>
                <FinanceDetailsList dao={dao} />
            </Page.Aside>
        </Page.Content>
    );
};
