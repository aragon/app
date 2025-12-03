'use client';

import { DaoFilterComponent } from '@/shared/components/daoFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { ReactNode } from 'react';
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
}

export const assetListFilterParam = 'subdao';

export const AssetListContainer: React.FC<IAssetListContainerProps> = (props) => {
    const { initialParams, daoId, ...otherProps } = props;

    const { t } = useTranslations();

    const { activeOption, setActiveOption, options } = useDaoFilterUrlParam({
        daoId,
        includeAllOption: true,
        name: assetListFilterParam,
    });

    return (
        <DaoFilterComponent
            slotId="FINANCE_ASSET_LIST"
            options={options}
            value={activeOption}
            onValueChange={setActiveOption}
            initialParams={initialParams}
            allOptionLabel={t('app.finance.assetList.groupTab')}
            Fallback={AssetListDefault}
            searchParamName={assetListFilterParam}
            {...otherProps}
        />
    );
};
