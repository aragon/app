'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDao } from '@/shared/api/daoService';
import {
    type IFilterComponentPlugin,
    type IPluginFilterComponentProps,
    PluginFilterComponent,
} from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import { subDaoDisplayUtils } from '@/shared/utils/subDaoDisplayUtils';
import type { ReactNode } from 'react';
import type { IGetAssetListParams } from '../../api/financeService';
import { AssetListDefault } from './assetListDefault';

export interface IAssetListContainerProps
    extends Pick<IPluginFilterComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
    value?: IFilterComponentPlugin<IDaoPlugin>;
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

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { activePlugin, setActivePlugin, plugins } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeGroupFilter: true,
        name: assetListFilterParam,
        enableUrlUpdate: onValueChange == null,
    });

    const seenDaoAddresses = new Set<string>();
    const processedPlugins = plugins?.reduce<Array<IFilterComponentPlugin<IDaoPlugin>>>((acc, plugin) => {
        const isGroupTab = plugin.id === pluginGroupFilter.id;
        const isParentTab = subDaoDisplayUtils.isParentPlugin({ dao, plugin: plugin.meta });
        const baseQueryParams = { ...initialParams.queryParams };
        const pluginDaoAddress = subDaoDisplayUtils.getPluginDaoAddress(plugin.meta);
        const pluginDaoId = isGroupTab
            ? daoId
            : `${dao?.network ?? ''}-${plugin.meta.daoAddress ?? plugin.meta.address}`;
        const onlyParent = isParentTab ? true : undefined;
        const pluginQueryParams = { ...baseQueryParams, daoId: pluginDaoId, address: undefined, onlyParent };
        const pluginInitialParams = { ...initialParams, queryParams: pluginQueryParams };

        const isDuplicateSubDao = !isGroupTab && pluginDaoAddress !== '' && seenDaoAddresses.has(pluginDaoAddress);
        if (isDuplicateSubDao) {
            return acc;
        }

        if (!isGroupTab && pluginDaoAddress !== '') {
            seenDaoAddresses.add(pluginDaoAddress);
        }

        const label = isGroupTab
            ? t('app.finance.assetList.groupTab')
            : subDaoDisplayUtils.getPluginDisplayName({
                  dao,
                  plugin: plugin.meta,
                  groupLabel: t('app.finance.assetList.groupTab'),
                  fallbackLabel: plugin.label,
              });

        acc.push({ ...plugin, label, props: { initialParams: pluginInitialParams, plugin: plugin.meta } });
        return acc;
    }, []);

    const resolvedValue = value ?? activePlugin;
    const resolvedValueWithLabel =
        processedPlugins?.find((plugin) => plugin.uniqueId === resolvedValue?.uniqueId) ?? resolvedValue;
    const resolvedOnValueChange = onValueChange ?? setActivePlugin;

    return (
        <PluginFilterComponent
            slotId="FINANCE_ASSET_LIST"
            plugins={processedPlugins}
            Fallback={AssetListDefault}
            value={resolvedValueWithLabel}
            onValueChange={resolvedOnValueChange}
            searchParamName={assetListFilterParam}
            {...otherProps}
        />
    );
};
