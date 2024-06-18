'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/ods';
import { AssetList } from '../../components/assetList';

export interface IDaoAssetsPageClientProps {}

export const DaoAssetsPageClient: React.FC<IDaoAssetsPageClientProps> = () => {
    const { t } = useTranslations();

    return (
        <Page.Content>
            <Page.Main
                title={t('app.finance.daoAssetsPage.main.title')}
                action={{ label: t('app.finance.daoAssetsPage.main.action') }}
            >
                <AssetList />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.finance.daoAssetsPage.aside.details.title')}>
                    <DefinitionList.Container>
                        <DefinitionList.Item term={t('app.finance.daoAssetsPage.aside.details.blockchain')}>
                            <p className="text-neutral-500">Ethereum Mainnet</p>
                        </DefinitionList.Item>
                    </DefinitionList.Container>
                </Page.Section>
            </Page.Aside>
        </Page.Content>
    );
};
