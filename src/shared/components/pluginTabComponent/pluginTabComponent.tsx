import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { Tabs } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { PluginSingleComponent } from '../pluginSingleComponent';
import type { IPluginTabComponentProps, ITabComponentPlugin } from './pluginTabComponent.api';

export const PluginTabComponent = <TMeta extends object, TProps extends object>(
    props: IPluginTabComponentProps<TMeta, TProps>,
) => {
    const { slotId, plugins = [], value, onValueChange, Fallback, ...otherProps } = props;

    const supportedPlugins = plugins.filter(
        (plugin) => pluginRegistryUtils.getSlotComponent({ slotId, pluginId: plugin.id }) != null,
    );

    const defaultActivePlugin = value ?? plugins[0];
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

    // The components renders null if there is no fallback specified for the slot-id AND the slot has no supported plugins.
    const hasNoContent = Fallback == null && !supportedPlugins.length;

    // The component renders a single slot component in two cases:
    // 1 - The fallback is not specified and the slot has only one supported plugin
    // 2 - The slot has one plugin and the fallback is specified
    const isSingleComponent =
        (supportedPlugins.length === 1 && Fallback == null) || (plugins.length === 1 && Fallback != null);

    if (hasNoContent) {
        return null;
    }

    if (isSingleComponent) {
        return (
            <PluginSingleComponent
                slotId={slotId}
                pluginId={plugins[0].id}
                Fallback={Fallback}
                {...plugins[0].props}
                {...otherProps}
            />
        );
    }

    return (
        <Tabs.Root value={activePlugin?.uniqueId} onValueChange={updateActivePlugin}>
            <Tabs.List>
                {plugins.map(({ uniqueId, id, label }) => (
                    <Tabs.Trigger key={uniqueId} label={label ?? id} value={uniqueId} />
                ))}
            </Tabs.List>
            {plugins.map(({ id, uniqueId, props }) => (
                <Tabs.Content key={uniqueId} value={uniqueId} className="pt-6">
                    <PluginSingleComponent
                        slotId={slotId}
                        pluginId={id}
                        Fallback={Fallback}
                        {...props}
                        {...otherProps}
                    />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};
