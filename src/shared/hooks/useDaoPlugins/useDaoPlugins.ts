import { type IDaoPlugin, type PluginInterfaceType, useDao } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
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
    includeGroupFilter?: boolean;
    /**
     * Only returns the plugin with the specified interfaceType when set.
     */
    interfaceType?: PluginInterfaceType;
    /**
     * Only returns the plugin with the specified slug when set.
     */
    slug?: string;
    /**
     * Only returns plugins with full execute permissions when set to true.
     */
    hasExecute?: boolean;
}

export const pluginGroupFilter: IFilterComponentPlugin<IDaoPlugin> = {
    id: 'all',
    uniqueId: 'all',
    label: '',
    meta: { slug: 'all' } as IDaoPlugin,
    props: {},
};

export const useDaoPlugins = (params: IUseDaoPluginsParams): Array<IFilterComponentPlugin<IDaoPlugin>> | undefined => {
    const { daoId, type, pluginAddress, includeSubPlugins, includeGroupFilter, interfaceType, slug, hasExecute } =
        params;

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const plugins = daoUtils.getDaoPlugins(dao, {
        type,
        pluginAddress,
        includeSubPlugins,
        interfaceType,
        slug,
        hasExecute,
    });

    const processedPlugins = plugins?.map((plugin) => ({
        id: plugin.interfaceType,
        uniqueId: plugin.slug,
        label: daoUtils.getPluginName(plugin),
        meta: plugin,
        props: {},
    }));

    const addGroupFilter = includeGroupFilter && processedPlugins != null && processedPlugins.length > 1;

    return addGroupFilter ? [pluginGroupFilter].concat(processedPlugins) : processedPlugins;
};
