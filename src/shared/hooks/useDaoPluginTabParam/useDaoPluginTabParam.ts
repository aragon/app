import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useMemo } from 'react';
import { useDaoPlugins, type IUseDaoPluginsParams } from '../useDaoPlugins';
import { useTabParam, type IUseTabParamParams } from '../useTabParam';

export interface IUseDaoPluginTabParamParams extends Omit<IUseTabParamParams, 'validTabs'>, IUseDaoPluginsParams {}

export const useDaoPluginTabParam = (params: IUseDaoPluginTabParamParams) => {
    const { name, fallbackValue: fallbackValueProp, enableUrlUpdate = true } = params;

    const plugins = useDaoPlugins(params);
    invariant(plugins != null, 'useDaoPluginTabParam: plugin list is empty.');

    const fallbackValue = fallbackValueProp ?? plugins[0].meta.slug;
    const validTabs = plugins.map((plugin) => plugin.uniqueId);
    const [activeTab, setActiveTab] = useTabParam({ name, fallbackValue, enableUrlUpdate, validTabs });

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
