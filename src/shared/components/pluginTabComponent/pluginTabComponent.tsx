import { pluginRegistryUtils, type SlotId } from '@/shared/utils/pluginRegistryUtils';
import { Tabs } from '@aragon/ods';
import { useState } from 'react';

export interface ITabComponentPlugin<TMeta extends object = object> {
    /**
     * ID of the plugin.
     */
    id: string;
    /**
     * ID to be used on the Tab component, must be unique.
     */
    tabId: string;
    /**
     * Label of the plugin to be displayed as on the tab list. Defaults to the plugin id when not set.
     */
    label?: string;
    /**
     * Additional metadata to be forwarded to the plugin component.
     */
    meta: TMeta;
}

export interface IPluginTabComponentProps<TMeta extends object = object> {
    /**
     * Id of the slot component to load.
     */
    slotId: SlotId;
    /**
     * Plugin definitions to load the component from.
     */
    plugins?: Array<ITabComponentPlugin<TMeta>>;
    /**
     * Current active plugin to be displayed, defaults to the first plugin.
     */
    value?: ITabComponentPlugin<TMeta>;
    /**
     * Callback triggered on active plugin change.
     */
    onValueChange?: (value: ITabComponentPlugin<TMeta>) => void;
    /**
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
}

export const PluginTabComponent = <TMeta extends object>(props: IPluginTabComponentProps<TMeta>) => {
    const { slotId, plugins = [], value, onValueChange, ...otherProps } = props;

    const pluginComponents = plugins
        .map((plugin) => ({
            ...plugin,
            Component: pluginRegistryUtils.getSlotComponent({ slotId, pluginId: plugin.id })!,
        }))
        .filter(({ Component }) => Component != null);

    const defaultActivePlugin = value ?? pluginComponents[0];
    const [activePlugin, setActivePlugin] = useState<ITabComponentPlugin<TMeta> | undefined>(defaultActivePlugin);

    const updateActivePlugin = (tabId: string) => {
        const plugin = plugins.find((plugin) => plugin.tabId === tabId)!;
        setActivePlugin(plugin);
        onValueChange?.(plugin);
    };

    if (!pluginComponents.length) {
        return null;
    }

    if (pluginComponents.length === 1) {
        const { Component } = pluginComponents[0];

        return <Component {...otherProps} />;
    }

    return (
        <Tabs.Root value={activePlugin?.tabId} onValueChange={updateActivePlugin}>
            <Tabs.List>
                {pluginComponents.map(({ tabId, id, label }) => (
                    <Tabs.Trigger key={tabId} label={label ?? id} value={tabId} />
                ))}
            </Tabs.List>
            {pluginComponents.map(({ tabId, Component, meta }) => (
                <Tabs.Content key={tabId} value={tabId} className="pt-5">
                    <Component {...otherProps} {...meta} />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};
