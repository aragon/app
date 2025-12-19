'use client';

import { useAssetList } from '@/modules/finance/api/financeService';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
import type { IGetAssetListParams } from '../../api/financeService';
import { AssetList, assetListFilterParam } from '../../components/assetList';
import { DaoFilterAsideCard } from '../../components/daoFilterAsideCard';

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

export const DaoAssetsPageClient: React.FC<IDaoAssetsPageClientProps> = (
    props,
) => {
    const { id, initialParams } = props;
    const { t } = useTranslations();

    const { activeOption } = useDaoFilterUrlParam({
        daoId: id,
        includeAllOption: true,
        name: assetListFilterParam,
    });

    const { data: dao } = useDao({
        urlParams: { id },
        queryParams: { onlyParent: activeOption?.onlyParent },
    });

    const allAssetsSelected = activeOption?.isAll ?? false;
    const selectedDaoId = activeOption?.daoId ?? id;
    const hasSubDaos = (dao?.subDaos?.length ?? 0) > 0;

    // Fetch assets for "All" view
    const { data: allAssetsMetadata } = useAssetList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: id,
            },
        },
        { enabled: allAssetsSelected },
    );

    // Fetch assets for selected DAO view
    const { data: selectedAssetsMetadata } = useAssetList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: selectedDaoId,
                onlyParent: activeOption?.onlyParent,
            },
        },
        { enabled: !(allAssetsSelected && hasSubDaos) },
    );

    if (dao == null) {
        return null;
    }

    return (
        <Page.Content>
            <Page.Main title={t('app.finance.daoAssetsPage.main.title')}>
                <AssetList.Container daoId={id} initialParams={initialParams} />
            </Page.Main>
            <Page.Aside>
                <DaoFilterAsideCard
                    activeOption={activeOption}
                    allMetadata={allAssetsMetadata?.pages[0]}
                    dao={dao}
                    selectedMetadata={selectedAssetsMetadata?.pages[0]}
                    statsType="assets"
                />
            </Page.Aside>
        </Page.Content>
    );
};
