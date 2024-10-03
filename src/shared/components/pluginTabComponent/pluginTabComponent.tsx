import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { Tabs } from '@aragon/ods';
import { useEffect, useState } from 'react';
import type { IPluginTabComponentProps, ITabComponentPlugin } from './pluginTabComponent.api';

export const PluginTabComponent = <TMeta extends object, TProps extends object>(
    props: IPluginTabComponentProps<TMeta, TProps>,
) => {
    const { slotId, plugins = [], value, onValueChange, ...otherProps } = props;

    const pluginComponents = plugins
        .map((plugin) => ({
            ...plugin,
            Component: pluginRegistryUtils.getSlotComponent({ slotId, pluginId: plugin.id })!,
        }))
        .filter(({ Component }) => Component != null);

    const defaultActivePlugin = value ?? pluginComponents[0];
    const [activePlugin, setActivePlugin] = useState<ITabComponentPlugin<TMeta, TProps> | undefined>(
        defaultActivePlugin,
    );

    const updateActivePlugin = (tabId: string) => {
        const plugin = plugins.find((plugin) => plugin.uniqueId === tabId)!;
        setActivePlugin(plugin);
        onValueChange?.(plugin);
    };

    // Update internal state on value property change
    useEffect(() => {
        if (value) {
            setActivePlugin(value);
        }
    }, [value]);

    if (!pluginComponents.length) {
        return null;
    }

    if (pluginComponents.length === 1) {
        const { Component, props } = pluginComponents[0];

        return <Component {...props} {...otherProps} />;
    }

    return (
        <Tabs.Root value={activePlugin?.uniqueId} onValueChange={updateActivePlugin}>
            <Tabs.List>
                {pluginComponents.map(({ uniqueId, id, label }) => (
                    <Tabs.Trigger key={uniqueId} label={label ?? id} value={uniqueId} />
                ))}
            </Tabs.List>
            {pluginComponents.map(({ uniqueId, Component, props }) => (
                <Tabs.Content key={uniqueId} value={uniqueId} className="pt-6">
                    <Component {...props} {...otherProps} />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};
