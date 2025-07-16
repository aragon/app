import { useTabParam } from '@/shared/hooks/useTabParam';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { Tabs } from '@aragon/gov-ui-kit';
import { PluginSingleComponent } from '../pluginSingleComponent';
import type { IPluginTabComponentProps } from './pluginTabComponent.api';

export const PluginTabComponent = <TMeta extends object, TProps extends object>(
    props: IPluginTabComponentProps<TMeta, TProps>,
) => {
    const {
        slotId,
        plugins = [],
        value,
        onValueChange,
        searchParamName = 'pluginTab',
        Fallback,
        ...otherProps
    } = props;

    const supportedPlugins = plugins.filter(
        (plugin) => pluginRegistryUtils.getSlotComponent({ slotId, pluginId: plugin.id }) != null,
    );

    // The components renders null if there is no fallback specified for the slot-id AND the slot has no supported plugins.
    const hasNoContent = Fallback == null && !supportedPlugins.length;

    // The component renders a single slot component in two cases:
    // 1 - The fallback is not specified and the slot has only one supported plugin
    // 2 - The slot has one plugin and the fallback is specified
    const isSingleComponent =
        (supportedPlugins.length === 1 && Fallback == null) || (plugins.length === 1 && Fallback != null);

    const fallbackValue = value?.uniqueId ?? plugins[0].uniqueId;
    const [activePlugin, setActivePlugin] = useTabParam({
        name: searchParamName,
        fallbackValue,
        enabled: onValueChange == null && !hasNoContent && !isSingleComponent,
        tabs: plugins.map((plugin) => plugin.uniqueId),
    });

    const updateActivePlugin = (tabId: string) => {
        const plugin = plugins.find((plugin) => plugin.uniqueId === tabId)!;
        setActivePlugin(plugin.uniqueId);
        onValueChange?.(plugin);
    };

    if (hasNoContent) {
        return null;
    }

    if (isSingleComponent) {
        const { id, props } = supportedPlugins.length === 1 ? supportedPlugins[0] : plugins[0];

        return <PluginSingleComponent slotId={slotId} pluginId={id} Fallback={Fallback} {...props} {...otherProps} />;
    }

    return (
        <Tabs.Root value={activePlugin} onValueChange={updateActivePlugin}>
            <Tabs.List>
                {plugins.map(({ uniqueId, label }) => (
                    <Tabs.Trigger key={uniqueId} label={label} value={uniqueId} />
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
