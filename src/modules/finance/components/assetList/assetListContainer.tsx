'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginFilterComponentProps, PluginFilterComponent } from '@/shared/components/pluginFilterComponent';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { ReactNode } from 'react';
import type { IGetAssetListParams } from '../../api/financeService';
import { AssetListDefault } from './assetListDefault';

export interface IAssetListContainerProps
    extends Pick<IPluginFilterComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
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
    const { initialParams, daoId, value, onValueChange, ...otherProps } = props;

    const { activePlugin, setActivePlugin, plugins } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        name: assetListFilterParam,
        enableUrlUpdate: onValueChange == null,
    });

    const processedPlugins = plugins?.map((plugin) => {
        const pluginInitialParams = {
            ...initialParams,
            queryParams: { ...initialParams.queryParams, address: plugin.meta.address },
        };

        return { ...plugin, props: { initialParams: pluginInitialParams, plugin: plugin.meta } };
    });

    return (
        <PluginFilterComponent
            slotId="FINANCE_ASSET_LIST"
            plugins={processedPlugins}
            Fallback={AssetListDefault}
            value={value ?? activePlugin}
            onValueChange={onValueChange ?? setActivePlugin}
            searchParamName={assetListFilterParam}
            {...otherProps}
        />
    );
};
