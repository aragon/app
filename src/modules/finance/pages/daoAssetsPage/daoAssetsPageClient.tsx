'use client';

import { useAssetList } from '@/modules/finance/api/financeService';
import { AssetListStats } from '@/modules/finance/components/assetListStats';
import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import { subDaoDisplayUtils } from '@/shared/utils/subDaoDisplayUtils';
import { invariant } from '@aragon/gov-ui-kit';
import type { IGetAssetListParams } from '../../api/financeService';
import { AssetList, assetListFilterParam } from '../../components/assetList';

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

    const { data: dao } = useDao({ urlParams: { id } });

    const { activePlugin, setActivePlugin } = useDaoPluginFilterUrlParam({
        daoId: id,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeGroupFilter: true,
        name: assetListFilterParam,
    });

    invariant(activePlugin != null, 'DaoAssetsPageClient: no valid plugin found.');

    const allAssetsSelected = activePlugin.uniqueId === 'all';
    const { data: allAssetsMetadata } = useAssetList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: id,
                address: undefined,
                pageSize: 1,
            },
        },
        { enabled: allAssetsSelected },
    );

    const tokenCount = allAssetsMetadata?.pages[0]?.metadata?.totalRecords;

    const matchingSubDao = subDaoDisplayUtils.getMatchingSubDao({ dao, plugin: activePlugin.meta });
    const isParentSelected = subDaoDisplayUtils.isParentPlugin({ dao, plugin: activePlugin.meta });

    const asideCardTitle = subDaoDisplayUtils.getPluginDisplayName({
        dao,
        plugin: activePlugin.meta,
        groupLabel: t('app.finance.daoAssetsPage.aside.summary'),
        fallbackLabel: activePlugin.label,
    });

    const hasSubDaos = (dao?.subDaos?.length ?? 0) > 0;

    const financeDetailsEntity = !allAssetsSelected ? (isParentSelected ? dao : matchingSubDao) : undefined;

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
                {dao && hasSubDaos && allAssetsSelected && (
                    <>
                        <Page.AsideCard title={asideCardTitle}>
                            <AssetListStats dao={dao} tokenCount={tokenCount} />
                        </Page.AsideCard>
                    </>
                )}
                {dao && !allAssetsSelected && financeDetailsEntity && (
                    <FinanceDetailsList entity={financeDetailsEntity} title={asideCardTitle} />
                )}
                {dao && !hasSubDaos && <FinanceDetailsList entity={dao} title={asideCardTitle} />}
            </Page.Aside>
        </>
    );
};
