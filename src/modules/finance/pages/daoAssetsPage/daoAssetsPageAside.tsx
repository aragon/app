'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/ods';

export interface IDaoAssetsPageAsideProps {}

export const DaoAssetsPageAside: React.FC<IDaoAssetsPageAsideProps> = () => {
    const { t } = useTranslations();

    return (
        <Page.Aside>
            <Page.Section title={t('app.finance.daoAssetsPage.aside.details.title')}>
                <DefinitionList.Container>
                    <DefinitionList.Item term={t('app.finance.daoAssetsPage.aside.details.blockchain')}>
                        <p className="text-neutral-500">Ethereum Mainnet</p>
                    </DefinitionList.Item>
                </DefinitionList.Container>
            </Page.Section>
        </Page.Aside>
    );
};
