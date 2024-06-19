'use client';

import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList/financeDetailsList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetList } from '../../components/assetList';

export interface IDaoAssetsPageClientProps {
    /**
     * DAO page parameters.
     */
    id: string;
}

export const DaoAssetsPageClient: React.FC<IDaoAssetsPageClientProps> = (props) => {
    const { id } = props;
    const { t } = useTranslations();

    const useDaoParams = { id };
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
