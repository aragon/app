import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import type { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IUseDaoPluginsParams {
    /**
     * ID of the DAO to get the plugins for.
     */
    daoId: string;
    /**
     * Only returns the plugins with the specified type when set.
     */
    type?: PluginType;
    /**
     * Only returns the plugin with the specified address when set.
     */
    pluginAddress?: string;
    /**
     * Include sub-plugins in the result.
     */
    includeSubPlugins?: boolean;
    /**
     * Adds an "all" tab component item when set to true and DAO has more than one plugin.
     */
    includeGroupedItem?: boolean;
    /**
     * Only returns the plugin with the specified subdomain when set.
     */
    subdomain?: string;
}

const groupedPluginItem: ITabComponentPlugin<IDaoPlugin> = {
    id: 'all',
    uniqueId: 'all',
    label: 'All',
    meta: { slug: '' } as IDaoPlugin,
    props: {},
};

export const useDaoPlugins = (params: IUseDaoPluginsParams): Array<ITabComponentPlugin<IDaoPlugin>> | undefined => {
    const { daoId, type, pluginAddress, includeSubPlugins, includeGroupedItem, subdomain } = params;

    const daoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoParams });

    const plugins = daoUtils.getDaoPlugins(dao, { type, pluginAddress, includeSubPlugins, subdomain });

    const processedPlugins = plugins?.map((plugin) => ({
        id: plugin.subdomain,
        uniqueId: `${plugin.subdomain}-${plugin.address}`,
        label: daoUtils.getPluginName(plugin),
        meta: plugin,
        props: {},
    }));

    const addGroupedItem = includeGroupedItem && processedPlugins != null && processedPlugins.length > 1;

    return addGroupedItem ? [groupedPluginItem].concat(processedPlugins) : processedPlugins;
};
