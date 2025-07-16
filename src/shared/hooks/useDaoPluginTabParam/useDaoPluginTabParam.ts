import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { useCallback, useMemo } from 'react';
import { useDaoPlugins, type IUseDaoPluginsParams } from '../useDaoPlugins';
import { useTabParam, type IUseTabParamParams } from '../useTabParam';

export interface IUseDaoPluginTabParamParams extends IUseTabParamParams, IUseDaoPluginsParams {}

export const useDaoPluginTabParam = (params: IUseDaoPluginTabParamParams) => {
    const { name, fallbackValue, ...otherParams } = params;

    const plugins = useDaoPlugins(otherParams)!;

    const processedFallbackValue = fallbackValue ?? plugins[0].meta.slug;
    const [activeTab, setActiveTab] = useTabParam({ name, fallbackValue: processedFallbackValue });

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
