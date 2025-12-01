'use client';

import { useDao, type ISubDaoSummary } from '@/shared/api/daoService';
import { PluginFilterComponent, type IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { IGetAssetListParams } from '../../api/financeService';
import { AssetListDefault } from './assetListDefault';

export interface IAssetListContainerProps {
    /**
     * Initial parameters to use for fetching the asset list.
     */
    initialParams: NestedOmit<IGetAssetListParams, 'queryParams.address'>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
    /**
     * External value control for the active SubDAO.
     */
    value?: IFilterComponentPlugin<ISubDaoSummary>;
    /**
     * Callback when the active SubDAO changes.
     */
    onValueChange?: (value: IFilterComponentPlugin<ISubDaoSummary>) => void;
}

export const assetListFilterParam = 'subdao';

export const AssetListContainer: React.FC<IAssetListContainerProps> = (props) => {
    const { initialParams, daoId, value, onValueChange, ...otherProps } = props;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    // Create filter items based on SubDAOs
    const filters = useMemo(() => {
        if (!dao?.subDaos || dao.subDaos.length === 0) {
            return [];
        }

        // Create "All" filter + one filter per SubDAO
        // Note: For "All" tab, use parent DAO's daoId to get aggregated parent + SubDAO data
        const allFilter: IFilterComponentPlugin<ISubDaoSummary> = {
            id: 'all',
            uniqueId: 'all',
            label: t('app.finance.assetList.groupTab'),
            meta: {} as ISubDaoSummary,
            props: {
                initialParams: {
                    ...initialParams,
                    queryParams: {
                        ...initialParams.queryParams,
                        daoId: dao.id,
                    },
                },
            },
        };

        const subDaoFilters: IFilterComponentPlugin<ISubDaoSummary>[] = dao.subDaos.map((subDao) => ({
            id: subDao.address,
            uniqueId: `${subDao.network}-${subDao.address}`,
            label: subDao.name,
            meta: subDao,
            props: {
                initialParams: {
                    ...initialParams,
                    queryParams: {
                        ...initialParams.queryParams,
                        daoId: subDao.id,
                    },
                },
            },
        }));

        return [allFilter, ...subDaoFilters];
    }, [dao, initialParams, t]);

    const validValues = filters.map((f) => f.uniqueId);
    const [activeFilterId, setActiveFilterId] = useFilterUrlParam({
        name: assetListFilterParam,
        fallbackValue: filters[0]?.uniqueId,
        validValues,
        enableUrlUpdate: onValueChange == null,
    });

    const activeFilter = filters.find((f) => f.uniqueId === activeFilterId) ?? filters[0];

    // If no SubDAOs, render AssetListDefault directly without tabs
    if (!dao?.subDaos || dao.subDaos.length === 0) {
        return (
            <AssetListDefault
                initialParams={{
                    ...initialParams,
                    queryParams: { ...initialParams.queryParams, daoId: dao?.id },
                }}
                {...otherProps}
            />
        );
    }

    return (
        <PluginFilterComponent
            slotId="FINANCE_ASSET_LIST"
            plugins={filters}
            Fallback={AssetListDefault}
            value={value ?? activeFilter}
            onValueChange={onValueChange ?? ((filter) => setActiveFilterId(filter.uniqueId))}
            searchParamName={assetListFilterParam}
            {...otherProps}
        />
    );
};
