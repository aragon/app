import { pluginUtils, type PluginId, type SlotId } from '@/shared/utils/pluginUtils';

export interface IPluginComponentProps {
    /**
     * Id of the slot component to load.
     */
    slotId: SlotId;
    /**
     * Plugin to load the component from.
     */
    pluginId: PluginId;
    /**
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
}

export const PluginComponent: React.FC<IPluginComponentProps> = (props) => {
    const { slotId, pluginId, ...otherProps } = props;

    const LoadedComponent = pluginUtils.getSlotComponent({ slotId, pluginId });

    if (LoadedComponent == null) {
        return null;
    }

    return <LoadedComponent {...otherProps} />;
};
