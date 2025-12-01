'use client';

import { AssetListStats } from '@/modules/finance/components/assetListStats';
import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList';
import { SubDaoInfo } from '@/modules/finance/components/subDaoInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import { invariant } from '@aragon/gov-ui-kit';
import type { IGetAssetListParams } from '../../api/financeService';
import { AssetList } from '../../components/assetList';
import { assetListFilterParam } from '../../components/assetList/assetListContainer';

export interface IDaoAssetsPageClientProps {
    /**
     * ID of the DAO.
     */
    id: string;
    /**
     * Initial parameters to use to fetch the DAO assets list.
     */
    initialParams: IGetAssetListParams;
}

export const DaoAssetsPageClient: React.FC<IDaoAssetsPageClientProps> = (props) => {
    const { id, initialParams } = props;
    const { t } = useTranslations();

    const useDaoParams = { id };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    const { activePlugin, setActivePlugin } = useDaoPluginFilterUrlParam({
        daoId: id,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeGroupFilter: true,
        name: assetListFilterParam,
    });

    invariant(activePlugin != null, 'DaoAssetsPageClient: no valid plugin found.');

    const allAssetsSelected = activePlugin.uniqueId === 'all';
    const asideCardTitle = allAssetsSelected ? t('app.finance.daoAssetsPage.aside.treasury') : activePlugin.label;

    return (
        <>
            <Page.Main title={t('app.finance.daoAssetsPage.main.title')}>
                <AssetList.Container
                    initialParams={initialParams}
                    daoId={id}
                    onValueChange={setActivePlugin}
                    value={activePlugin}
                />
            </Page.Main>
            <Page.Aside>
                {dao && allAssetsSelected && (
                    <>
                        <Page.AsideCard title={asideCardTitle}>
                            <AssetListStats dao={dao} />
                        </Page.AsideCard>
                        <FinanceDetailsList dao={dao} />
                    </>
                )}
                {dao && !allAssetsSelected && (
                    <Page.AsideCard title={asideCardTitle}>
                        <SubDaoInfo plugin={activePlugin.meta} network={dao.network} daoId={id} />
                    </Page.AsideCard>
                )}
            </Page.Aside>
        </>
    );
};
