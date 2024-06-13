import { pluginRegistryUtils, type PluginId, type SlotId } from '@/shared/utils/pluginRegistryUtils';

export interface IPluginComponentProps {
    /**
     * Id of the slot component to load.
     */
    slotId: SlotId;
    /**
     * Plugin IDs to load the component from. The component renders only the first component slot found.
     */
    pluginIds: PluginId[];
    /**
     * Eventual children of the loaded component.
     */
    componentChildren?: ReactNode;
    /**
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
}

export const PluginComponent: React.FC<IPluginComponentProps> = (props) => {
    const { slotId, pluginIds, ...otherProps } = props;

    const LoadedComponent = pluginIds
        .map((pluginId) => pluginRegistryUtils.getSlotComponent({ slotId, pluginId }))
        .find((component) => component != null);

    if (LoadedComponent == null) {
        return null;
    }

    return <LoadedComponent {...otherProps} />;
};
