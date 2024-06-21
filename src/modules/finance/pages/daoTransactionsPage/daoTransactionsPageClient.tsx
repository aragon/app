'use client';

import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList/financeDetailsList';
import { TransactionList } from '@/modules/finance/components/transactionList/transactionList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IDaoTransactionsPageClientProps {
    /**
     * DAO page parameters.
     */
    id: string;
}

export const DaoTransactionsPageClient: React.FC<IDaoTransactionsPageClientProps> = (props) => {
    const { id } = props;
    const { t } = useTranslations();

    const useDaoParams = { id };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    return (
        <Page.Content>
            <Page.Main
                title={t('app.finance.daoTransactionsPage.main.title')}
                action={{ label: t('app.finance.daoTransactionsPage.main.action') }}
            >
                <TransactionList address={dao?.address} network={dao?.network} />
            </Page.Main>
            <Page.Aside>
                <FinanceDetailsList network={dao?.network} vaultAddress={dao?.address} ensAddress={dao?.ens} />
            </Page.Aside>
        </Page.Content>
    );
};
