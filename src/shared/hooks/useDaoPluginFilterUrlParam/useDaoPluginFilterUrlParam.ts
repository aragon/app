import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useCallback, useMemo } from 'react';
import { useDaoPlugins, type IUseDaoPluginsParams } from '../useDaoPlugins';
import { useFilterUrlParam, type IUseFilterUrlParamParams } from '../useFilterUrlParam';

export interface IUseDaoPluginFilterUrlParamParams
    extends Omit<IUseFilterUrlParamParams, 'validValues'>,
        IUseDaoPluginsParams {}

export const useDaoPluginFilterUrlParam = (params: IUseDaoPluginFilterUrlParamParams) => {
    const { name, fallbackValue: fallbackValueProp, enableUrlUpdate = true } = params;

    const plugins = useDaoPlugins(params);

    const fallbackValue = fallbackValueProp ?? plugins?.[0]?.uniqueId;
    const validValues = plugins?.map((plugin) => plugin.uniqueId);
    const [activeFilter, setActiveFilter] = useFilterUrlParam({ name, fallbackValue, enableUrlUpdate, validValues });

    const activePlugin = useMemo(
        () =>
            plugins?.find(
                (plugin) =>
                    plugin.uniqueId === activeFilter ||
                    // backward compatibility for old URLs that used slug only
                    plugin.meta.slug === activeFilter,
            ) ?? plugins?.[0],
        [plugins, activeFilter],
    );

    const setActivePlugin = useCallback(
        (plugin: IFilterComponentPlugin<IDaoPlugin>) => setActiveFilter(plugin.uniqueId),
        [setActiveFilter],
    );

    return { activePlugin, setActivePlugin, plugins };
};
