'use client';

import { useAssetList } from '@/modules/finance/api/financeService';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
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

    const { activeOption } = useDaoFilterUrlParam({
        daoId: id,
        includeAllOption: true,
        name: assetListFilterParam,
    });

    invariant(activeOption != null, 'DaoAssetsPageClient: no valid DAO filter option found.');

    const allAssetsSelected = activeOption.isAll;
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

    // Get the selected DAO (parent or SubDAO)
    const selectedDaoId = activeOption.daoId ?? id;
    const matchingSubDao = dao?.subDaos?.find((subDao) => subDao.id === selectedDaoId);
    const selectedDao = activeOption.isParent ? dao : (matchingSubDao ?? dao);

    const hasSubDaos = (dao?.subDaos?.length ?? 0) > 0;

    const { data: selectedAssetsMetadata } = useAssetList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: selectedDaoId,
                onlyParent: activeOption.onlyParent,
            },
        },
        { enabled: !allAssetsSelected || !hasSubDaos },
    );

    const selectedAssetCount = selectedAssetsMetadata?.pages[0]?.metadata?.totalRecords;

    const asideCardTitle = activeOption.isAll ? t('app.finance.daoAssetsPage.aside.summary') : activeOption.label;

    const asideMetrics = selectedDao?.metrics;
    const assetStats: Array<{ label: string; value: string | number }> = [
        {
            label: t('app.finance.assetListStats.totalValueUsd'),
            value: asideMetrics
                ? (formatterUtils.formatNumber(asideMetrics.tvlUSD, { format: NumberFormat.FIAT_TOTAL_SHORT }) ??
                  asideMetrics.tvlUSD)
                : '-',
        },
        {
            label: t('app.finance.assetListStats.tokens'),
            value:
                selectedAssetCount != null
                    ? (formatterUtils.formatNumber(selectedAssetCount, { format: NumberFormat.GENERIC_SHORT }) ??
                      selectedAssetCount)
                    : '-',
        },
    ];

    return (
        <Page.Content>
            <Page.Main title={t('app.finance.daoAssetsPage.main.title')}>
                <AssetList.Container initialParams={initialParams} daoId={id} />
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={asideCardTitle}>
                    {dao && allAssetsSelected && <AssetListStats dao={dao} tokenCount={tokenCount} />}
                    {dao && !allAssetsSelected && (
                        <DaoInfoAside
                            daoId={selectedDaoId}
                            network={dao.network}
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
