'use client';

import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetList } from '../../components/assetList';

export interface IDaoAssetsPageClientProps {
    /**
     * ID of the DAO.
     */
    id: string;
}

export const DaoAssetsPageClient: React.FC<IDaoAssetsPageClientProps> = (props) => {
    const { id } = props;
    const { t } = useTranslations();

    const useDaoParams = { id };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const pageSize = 6;

    const assetListParams = {
        queryParams: {
            daoAddress: dao?.address,
            network: dao?.network,
            pageSize,
        },
    };

    return (
        <Page.Content>
            <Page.Main title={t('app.finance.daoAssetsPage.main.title')}>
                <AssetList initialParams={assetListParams} />
            </Page.Main>
            <Page.Aside>
                <FinanceDetailsList dao={dao} />
            </Page.Aside>
        </Page.Content>
    );
};
