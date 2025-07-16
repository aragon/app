import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { useCallback, useMemo } from 'react';
import { useDaoPlugins, type IUseDaoPluginsParams } from '../useDaoPlugins';
import { useTabParam, type IUseTabParamParams } from '../useTabParam';

export interface IUseDaoPluginTabParamParams extends Omit<IUseTabParamParams, 'tabs'>, IUseDaoPluginsParams {}

export const useDaoPluginTabParam = (params: IUseDaoPluginTabParamParams) => {
    const { name, fallbackValue, enabled = true } = params;

    const plugins = useDaoPlugins(params)!;

    const processedFallbackValue = fallbackValue ?? plugins[0].meta.slug;
    const [activeTab, setActiveTab] = useTabParam({
        name,
        fallbackValue: processedFallbackValue,
        enabled,
        tabs: plugins.map((plugin) => plugin.uniqueId),
    });

    const selectedPlugin = useMemo(
        () => plugins.find((plugin) => plugin.meta.slug === activeTab) ?? plugins[0],
        [plugins, activeTab],
    );

    const setSelectedPlugin = useCallback(
        (plugin: ITabComponentPlugin<IDaoPlugin>) => setActiveTab(plugin.meta.slug),
        [setActiveTab],
    );

    return { selectedPlugin, setSelectedPlugin, plugins };
};
