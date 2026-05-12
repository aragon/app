import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { PluginSingleComponent } from '../pluginSingleComponent';
import type {
    IFilterComponentPlugin,
    IPluginFilterComponentProps,
} from './pluginFilterComponent.api';

export const pluginFilterComponentFilterParam = 'plugin';

export const PluginFilterComponent = <
    TMeta extends object,
    TProps extends object,
>(
    props: IPluginFilterComponentProps<TMeta, TProps>,
) => {
    const {
        slotId,
        plugins = [],
        value,
        onValueChange,
        searchParamName = pluginFilterComponentFilterParam,
        Fallback,
        renderContent,
        ...otherProps
    } = props;

    const supportedPlugins = plugins.filter(
        (plugin) =>
            plugin.renderContent != null ||
            pluginRegistryUtils.getSlotComponent({
                slotId,
                pluginId: plugin.id,
            }) != null,
    );

    // The components renders null if there is no fallback specified for the slot-id AND the slot has no supported plugins.
    const hasNoContent = Fallback == null && !supportedPlugins.length;

    // The component renders a single slot component in two cases:
    // 1 - The fallback is not specified and the slot has only one supported plugin
    // 2 - The slot has one plugin and the fallback is specified
    const isSingleComponent =
        (supportedPlugins.length === 1 && Fallback == null) ||
        (plugins.length === 1 && Fallback != null);

    const fallbackValue = value?.uniqueId ?? plugins[0]?.uniqueId;
    const [activePlugin, setActivePlugin] = useFilterUrlParam({
        fallbackValue,
        enableUrlUpdate:
            onValueChange == null && !hasNoContent && !isSingleComponent,
        name: searchParamName,
        validValues: plugins.map((plugin) => plugin.uniqueId),
    });

    const handleChange = (uniqueId?: string) => {
        if (!uniqueId || uniqueId === activePlugin) {
            return;
        }

        const plugin = plugins.find((p) => p.uniqueId === uniqueId);
        if (!plugin) {
            return;
        }

        setActivePlugin(uniqueId);
        onValueChange?.(plugin);
    };

    const activePluginRecord = plugins.find(
        (plugin) => plugin.uniqueId === activePlugin,
    );

    const getPluginContent = (
        plugin: IFilterComponentPlugin<TMeta, TProps>,
    ) => {
        if (renderContent != null) {
            return renderContent(plugin);
        }

        if (plugin.renderContent != null) {
            return plugin.renderContent();
        }

        return (
            <PluginSingleComponent
                Fallback={Fallback}
                plugin={plugin.meta}
                pluginId={plugin.id}
                slotId={slotId}
                {...plugin.props}
                {...otherProps}
            />
        );
    };

    if (hasNoContent) {
        return null;
    }

    if (isSingleComponent) {
        const singlePlugin =
            supportedPlugins.length === 1 ? supportedPlugins[0] : plugins[0];

        return getPluginContent(singlePlugin);
    }

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <ToggleGroup
                isMultiSelect={false}
                onChange={handleChange}
                value={activePlugin}
            >
                {plugins.map(({ uniqueId, label, className }) => (
                    <Toggle
                        className={className}
                        key={uniqueId}
                        label={label}
                        value={uniqueId}
                    />
                ))}
            </ToggleGroup>

            {activePluginRecord != null && getPluginContent(activePluginRecord)}
        </div>
    );
};
