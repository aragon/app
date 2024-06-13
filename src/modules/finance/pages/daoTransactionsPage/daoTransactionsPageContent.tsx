'use client';

import { TransactionList } from '@/modules/finance/components/transactionList/transactionList';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/ods';

export interface IDaoTransactionsPageContentProps {}

export const DaoTransactionsPageContent: React.FC<IDaoTransactionsPageContentProps> = () => {
    const { t } = useTranslations();

    return (
        <Page.Content>
            <Page.Main
                title={t('app.finance.daoTransactionsPage.main.title')}
                action={{ label: t('app.finance.daoTransactionsPage.main.action') }}
            >
                <TransactionList />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.finance.daoTransactionsPage.aside.details.title')}>
                    <DefinitionList.Container>
                        <DefinitionList.Item term={t('app.finance.daoTransactionsPage.aside.details.blockchain')}>
                            <p className="text-neutral-500">Ethereum Mainnet</p>
                        </DefinitionList.Item>
                    </DefinitionList.Container>
                </Page.Section>
            </Page.Aside>
        </Page.Content>
    );
};
