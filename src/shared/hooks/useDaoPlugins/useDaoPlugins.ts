import { type IDaoPlugin, type PluginInterfaceType, useDao } from '@/shared/api/daoService';
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
    includeGroupTab?: boolean;
    /**
     * Only returns the plugin with the specified interfaceType when set.
     */
    interfaceType?: PluginInterfaceType;
    /**
     * Only returns the plugin with the specified slug when set.
     */
    slug?: string;
}

export const pluginGroupTab: ITabComponentPlugin<IDaoPlugin> = {
    id: 'all',
    uniqueId: 'all',
    label: '',
    meta: { slug: 'all' } as IDaoPlugin,
    props: {},
};

export const useDaoPlugins = (params: IUseDaoPluginsParams): Array<ITabComponentPlugin<IDaoPlugin>> | undefined => {
    const { daoId, type, pluginAddress, includeSubPlugins, includeGroupTab, interfaceType, slug } = params;

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const plugins = daoUtils.getDaoPlugins(dao, { type, pluginAddress, includeSubPlugins, interfaceType, slug });

    const processedPlugins = plugins?.map((plugin) => ({
        id: plugin.interfaceType,
        uniqueId: plugin.slug,
        label: daoUtils.getPluginName(plugin),
        meta: plugin,
        props: {},
    }));

    const addGroupTab = includeGroupTab && processedPlugins != null && processedPlugins.length > 1;

    return addGroupTab ? [pluginGroupTab].concat(processedPlugins) : processedPlugins;
};
