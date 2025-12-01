'use client';

import { AssetListStats } from '@/modules/finance/components/assetListStats';
import { FinanceDetailsList } from '@/modules/finance/components/financeDetailsList';
import { SubDaoInfo } from '@/modules/finance/components/subDaoInfo';
import { useDao, type ISubDaoSummary } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { useMemo } from 'react';
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

    const { data: dao } = useDao({ urlParams: { id } });

    // Create filter items based on SubDAOs (same logic as Container for consistency)
    const filters = useMemo(() => {
        if (!dao?.subDaos || dao.subDaos.length === 0) {
            return [];
        }

        const allFilter = { id: 'all', uniqueId: 'all', label: t('app.finance.daoAssetsPage.aside.treasury') };
        const subDaoFilters = dao.subDaos.map((subDao) => ({
            id: subDao.address,
            uniqueId: `${subDao.network}-${subDao.address}`,
            label: subDao.name,
            meta: subDao,
        }));

        return [allFilter, ...subDaoFilters];
    }, [dao, t]);

    const validValues = filters.map((f) => f.uniqueId);
    const [activeFilterId] = useFilterUrlParam({
        name: assetListFilterParam,
        fallbackValue: filters[0]?.uniqueId,
        validValues,
    });

    const activeFilter = filters.find((f) => f.uniqueId === activeFilterId) ?? filters[0];
    const allAssetsSelected = activeFilter?.uniqueId === 'all';
    const asideCardTitle = allAssetsSelected
        ? t('app.finance.daoAssetsPage.aside.treasury')
        : (activeFilter?.label ?? '');

    // If no SubDAOs, show FinanceDetailsList only
    const hasSubDaos = dao?.subDaos && dao.subDaos.length > 0;

    return (
        <>
            <Page.Main title={t('app.finance.daoAssetsPage.main.title')}>
                <AssetList.Container initialParams={initialParams} daoId={id} />
            </Page.Main>
            <Page.Aside>
                {dao && hasSubDaos && allAssetsSelected && (
                    <>
                        <Page.AsideCard title={asideCardTitle}>
                            <AssetListStats dao={dao} />
                        </Page.AsideCard>
                        <FinanceDetailsList dao={dao} />
                    </>
                )}
                {dao && hasSubDaos && !allAssetsSelected && activeFilter && 'meta' in activeFilter && (
                    <Page.AsideCard title={asideCardTitle}>
                        <SubDaoInfo plugin={activeFilter.meta as ISubDaoSummary} network={dao.network} daoId={id} />
                    </Page.AsideCard>
                )}
                {dao && !hasSubDaos && <FinanceDetailsList dao={dao} />}
            </Page.Aside>
        </>
    );
};
