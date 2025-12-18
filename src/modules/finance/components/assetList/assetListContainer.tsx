'use client';

import type { ReactNode } from 'react';
import { DaoFilterComponent } from '@/shared/components/daoFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
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
            allOptionLabel={t('app.finance.assetList.groupTab')}
            Fallback={AssetListDefault}
            initialParams={initialParams}
            onValueChange={setActiveOption}
            options={options}
            searchParamName={assetListFilterParam}
            slotId="FINANCE_ASSET_LIST"
            value={activeOption}
            {...otherProps}
        />
    );
};
