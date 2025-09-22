import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { PluginSingleComponent } from '../pluginSingleComponent';
import type { IPluginFilterComponentProps } from './pluginFilterComponent.api';

export const pluginFilterComponentFilterParam = 'plugin';

export const PluginFilterComponent = <TMeta extends object, TProps extends object>(
    props: IPluginFilterComponentProps<TMeta, TProps>,
) => {
    const {
        slotId,
        plugins = [],
        value,
        onValueChange,
        searchParamName = pluginFilterComponentFilterParam,
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

    const fallbackValue = value?.uniqueId ?? plugins[0]?.uniqueId;
    const [activePlugin, setActivePlugin] = useFilterUrlParam({
        fallbackValue,
        enableUrlUpdate: onValueChange == null && !hasNoContent && !isSingleComponent,
        name: searchParamName,
        validValues: plugins.map((plugin) => plugin.uniqueId),
    });

    const updateActivePlugin = (uniqueId: string) => {
        const plugin = plugins.find((plugin) => plugin.uniqueId === uniqueId)!;
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
        <div>
            <ToggleGroup
                isMultiSelect={false}
                defaultValue={activePlugin}
                onChange={(val) => {
                    updateActivePlugin(val!);
                }}
            >
                {plugins.map(({ uniqueId, label }) => (
                    <Toggle key={uniqueId} label={label} value={uniqueId} />
                ))}
            </ToggleGroup>

            {plugins.map(({ id, uniqueId, props: pluginProps }) => {
                const isActive = activePlugin === uniqueId;
                return (
                    <div key={uniqueId} role="region" hidden={!isActive} className="pt-6">
                        {isActive ? (
                            <PluginSingleComponent
                                slotId={slotId}
                                pluginId={id}
                                Fallback={Fallback}
                                {...pluginProps}
                                {...otherProps}
                            />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};
