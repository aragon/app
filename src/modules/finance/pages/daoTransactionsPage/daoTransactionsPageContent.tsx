'use client';

import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList/financeDetailsList';
import { TransactionList } from '@/modules/finance/components/transactionList/transactionList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IDaoTransactionsPageContentProps {
    /**
     * DAO page parameters.
     */
    slug: string;
}

export const DaoTransactionsPageContent: React.FC<IDaoTransactionsPageContentProps> = (props) => {
    const { slug } = props;
    const { t } = useTranslations();

    const useDaoParams = { slug };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    return (
        <Page.Content>
            <Page.Main
                title={t('app.finance.daoTransactionsPage.main.title')}
                action={{ label: t('app.finance.daoTransactionsPage.main.action') }}
            >
                <TransactionList />
            </Page.Main>
            <Page.Aside>
                <FinanceDetailsList network={dao?.network} vaultAddress={dao?.address} ensAddress={dao?.ens} />
            </Page.Aside>
        </Page.Content>
    );
};
