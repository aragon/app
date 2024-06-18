'use client';

import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetList } from '../../components/assetList';
import { DetailsList } from '@/modules/finance/components/detailsList/detailsList';

export interface IDaoAssetsPageContentProps {
    /**
     * DAO page parameters.
     */
    slug: string;
}

export const DaoAssetsPageContent: React.FC<IDaoAssetsPageContentProps> = (props) => {
    const { slug } = props;
    const { t } = useTranslations();

    const useDaoParams = { slug };
    const { data: dao, isLoading: daoLoading } = useDao({ urlParams: useDaoParams });

    return (
        <Page.Content>
            <Page.Main
                title={t('app.finance.daoAssetsPage.main.title')}
                action={{ label: t('app.finance.daoAssetsPage.main.action') }}
            >
                <AssetList />
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
