import { Tabs } from '@aragon/ods';
import { useEffect, useState } from 'react';
import { PluginSingleComponent } from '../pluginSingleComponent';
import type { IPluginTabComponentProps, ITabComponentPlugin } from './pluginTabComponent.api';

export const PluginTabComponent = <TMeta extends object, TProps extends object>(
    props: IPluginTabComponentProps<TMeta, TProps>,
) => {
    const { slotId, plugins = [], value, onValueChange, Fallback, children, ...otherProps } = props;

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

    if (!plugins.length) {
        return null;
    }

    if (plugins.length === 1) {
        return (
            <PluginSingleComponent slotId={slotId} pluginId={plugins[0].id} {...plugins[0].props} {...otherProps}>
                {Fallback != null && <Fallback>{children}</Fallback>}
            </PluginSingleComponent>
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
                    <PluginSingleComponent slotId={slotId} pluginId={id} {...props} {...otherProps}>
                        {Fallback != null && <Fallback>{children}</Fallback>}
                    </PluginSingleComponent>
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};
