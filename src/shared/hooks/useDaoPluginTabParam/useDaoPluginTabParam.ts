import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { useCallback } from 'react';
import { useDaoPlugins, type IUseDaoPluginsParams } from '../useDaoPlugins';
import { useTabParam, type IUseTabParamParams } from '../useTabParam';

export interface IUseDaoPluginTabParamParams extends IUseTabParamParams, IUseDaoPluginsParams {}

export const useDaoPluginTabParam = (params: IUseDaoPluginTabParamParams) => {
    const { name, initialValue, ...otherParams } = params;

    const plugins = useDaoPlugins(otherParams) ?? [];
    const [activeTab, setActiveTab] = useTabParam({ name, initialValue: plugins[0].meta.slug });

    const selectedPlugin = plugins.find((plugin) => plugin.meta.slug === activeTab) ?? plugins[0];
    const setSelectedPlugin = useCallback(
        (plugin: ITabComponentPlugin<IDaoPlugin>) => setActiveTab(plugin.meta.slug),
        [setActiveTab],
    );

    return { selectedPlugin, setSelectedPlugin, plugins };
};
