import { pluginRegistryUtils, type PluginId, type SlotId } from '@/shared/utils/pluginRegistryUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FallbackComponent = React.FC<any>;

export interface IPluginSingleComponentProps {
    /**
     * Id of the slot component to load.
     */
    slotId: SlotId;
    /**
     * Plugin ID to load the component from.
     */
    pluginId: PluginId;
    /**
     * Fallback component rendered if no components is registered with the specified slot and plugin IDs
     */
    Fallback?: FallbackComponent;
    /**
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
}

export const PluginSingleComponent: React.FC<IPluginSingleComponentProps> = (props) => {
    const { slotId, pluginId, Fallback, ...otherProps } = props;

    const LoadedComponent = pluginRegistryUtils.getSlotComponent({ slotId, pluginId });

    if (LoadedComponent == null) {
        return Fallback?.({ ...otherProps });
    }

    return <LoadedComponent {...otherProps} />;
};
