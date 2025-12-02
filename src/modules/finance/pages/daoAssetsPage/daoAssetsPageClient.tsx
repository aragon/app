'use client';

import { useAssetList } from '@/modules/finance/api/financeService';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import { subDaoDisplayUtils } from '@/shared/utils/subDaoDisplayUtils';
import { formatterUtils, invariant, NumberFormat } from '@aragon/gov-ui-kit';
import type { IGetAssetListParams } from '../../api/financeService';
import { AssetList, assetListFilterParam } from '../../components/assetList';
import { AssetListStats } from '../../components/assetListStats';
import { DaoInfoAside } from '../../components/daoInfoAside';

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
            },
        },
        { enabled: allAssetsSelected },
    );

    const tokenCount = allAssetsMetadata?.pages[0]?.metadata?.totalRecords;

    const matchingSubDao = subDaoDisplayUtils.getMatchingSubDao({ dao, plugin: activePlugin.meta });
    const isParentSelected = subDaoDisplayUtils.isParentPlugin({ dao, plugin: activePlugin.meta });
    const selectedDao = !allAssetsSelected ? (isParentSelected ? dao : (matchingSubDao ?? dao)) : dao;
    const selectedDaoId = selectedDao?.id ?? dao?.id ?? id;

    const hasSubDaos = (dao?.subDaos?.length ?? 0) > 0;

    const { data: selectedAssetsMetadata } = useAssetList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: selectedDaoId,
            },
        },
        { enabled: !allAssetsSelected || !hasSubDaos },
    );

    const selectedAssetCount = selectedAssetsMetadata?.pages[0]?.metadata?.totalRecords;

    const asideCardTitle = subDaoDisplayUtils.getPluginDisplayName({
        dao,
        plugin: activePlugin.meta,
        groupLabel: t('app.finance.daoAssetsPage.aside.summary'),
        fallbackLabel: activePlugin.label,
    });

    const asideMetrics = selectedDao?.metrics;
    const assetStats: Array<{ label: string; value: string | number }> =
        asideMetrics != null
            ? ([
                  {
                      label: t('app.finance.assetListStats.totalValueUsd'),
                      value:
                          formatterUtils.formatNumber(asideMetrics.tvlUSD, { format: NumberFormat.FIAT_TOTAL_SHORT }) ??
                          asideMetrics.tvlUSD,
                  },
                  selectedAssetCount != null && {
                      label: t('app.finance.assetListStats.tokens'),
                      value:
                          formatterUtils.formatNumber(selectedAssetCount, { format: NumberFormat.GENERIC_SHORT }) ??
                          selectedAssetCount,
                  },
              ].filter(Boolean) as Array<{ label: string; value: string | number }>)
            : [];

    return (
        <Page.Content>
            <Page.Main title={t('app.finance.daoAssetsPage.main.title')}>
                <AssetList.Container
                    initialParams={initialParams}
                    daoId={id}
                    onValueChange={setActivePlugin}
                    value={activePlugin}
                />
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={asideCardTitle}>
                    {dao && allAssetsSelected && <AssetListStats dao={dao} tokenCount={tokenCount} />}
                    {dao && !allAssetsSelected && (
                        <DaoInfoAside
                            plugin={activePlugin.meta}
                            network={dao.network}
                            daoId={selectedDaoId ?? id}
                            dao={dao}
                            subDao={matchingSubDao}
                            stats={assetStats}
                        />
                    )}
                </Page.AsideCard>
            </Page.Aside>
        </Page.Content>
    );
};
