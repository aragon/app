'use client';

import { DetailsList } from '@/modules/finance/components/detailsList/detailsList';
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
    const { data: dao, isLoading: daoLoading } = useDao({ urlParams: useDaoParams });

    return (
        <Page.Content>
            <Page.Main
                title={t('app.finance.daoTransactionsPage.main.title')}
                action={{ label: t('app.finance.daoTransactionsPage.main.action') }}
            >
                <TransactionList />
            </Page.Main>
            <Page.Aside>
                <DetailsList
                    network={dao?.network}
                    vaultAddress={dao?.address}
                    ensAddress={dao?.ens}
                    isLoading={daoLoading}
                />
            </Page.Aside>
        </Page.Content>
    );
};
