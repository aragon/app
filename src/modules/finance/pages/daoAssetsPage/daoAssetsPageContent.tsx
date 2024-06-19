'use client';

import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList/financeDetailsList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetList } from '../../components/assetList';

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
    const { data: dao } = useDao({ urlParams: useDaoParams });

    return (
        <Page.Content>
            <Page.Main
                title={t('app.finance.daoAssetsPage.main.title')}
                action={{ label: t('app.finance.daoAssetsPage.main.action') }}
            >
                <AssetList />
            </Page.Main>
            <Page.Aside>
                <FinanceDetailsList network={dao?.network} vaultAddress={dao?.address} ensAddress={dao?.ens} />
            </Page.Aside>
        </Page.Content>
    );
};
