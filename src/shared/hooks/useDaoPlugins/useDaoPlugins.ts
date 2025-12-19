import {
    type IDaoPlugin,
    type PluginInterfaceType,
    useDao,
} from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
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

interface IBuildFilterPluginsParams {
    plugins?: IDaoPlugin[];
    rootDaoAddress?: string;
    includeGroupFilter?: boolean;
    isSubDaoEnabled: boolean;
}

/**
 * Normalizes raw plugins from the backend into filter-ready items:
 * - applies SubDAO feature-flag behaviour (aggregate vs single DAO),
 * - optionally groups plugins by (daoAddress, slug) when aggregating,
 * - builds `IFilterComponentPlugin` items and group tab when needed.
 */
const buildFilterPlugins = (
    params: IBuildFilterPluginsParams,
): IFilterComponentPlugin<IDaoPlugin>[] => {
    const { plugins, rootDaoAddress, includeGroupFilter, isSubDaoEnabled } =
        params;

    const allPlugins = plugins ?? [];

    // When SubDAO feature is disabled, only use plugins installed on the current DAO
    // (ignore SubDAO plugins returned by the API).
    const filteredPlugins = isSubDaoEnabled
        ? allPlugins
        : allPlugins.filter((plugin) => {
              const daoAddress = plugin.daoAddress ?? rootDaoAddress;

              // Legacy behaviour: when daoAddress is unknown, keep the plugin.
              if (daoAddress == null) {
                  return true;
              }

              return daoAddress === rootDaoAddress;
          });

    const processedPlugins: IFilterComponentPlugin<IDaoPlugin>[] =
        filteredPlugins.map((plugin) => ({
            id: plugin.interfaceType,
            uniqueId: `${plugin.address}-${plugin.slug}`,
            label: daoUtils.getPluginName(plugin),
            meta: plugin,
            props: {},
        }));

    const addGroupFilter = includeGroupFilter && processedPlugins.length > 1;

    return addGroupFilter
        ? [pluginGroupFilter].concat(processedPlugins)
        : processedPlugins;
};

export const useDaoPlugins = (
    params: IUseDaoPluginsParams,
): IFilterComponentPlugin<IDaoPlugin>[] | undefined => {
    const {
        daoId,
        type,
        pluginAddress,
        includeSubPlugins,
        includeGroupFilter,
        interfaceType,
        slug,
        hasExecute,
    } = params;

    const { isEnabled } = useFeatureFlags();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const plugins = daoUtils.getDaoPlugins(dao, {
        type,
        pluginAddress,
        includeSubPlugins,
        interfaceType,
        slug,
        hasExecute,
    });

    const isSubDaoEnabled = isEnabled('subDao');
    const processedPlugins = buildFilterPlugins({
        plugins,
        rootDaoAddress: dao?.address,
        includeGroupFilter,
        isSubDaoEnabled,
    });

    return processedPlugins;
};
