import { pluginRegistryUtils, type PluginId, type SlotId } from '@/shared/utils/pluginRegistryUtils';
import { cloneElement, isValidElement, type ReactNode } from 'react';

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
     * Fallback component to be rendered if no components are registered for the specified slot.
     */
    children?: ReactNode;
    /**
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
}

export const PluginSingleComponent: React.FC<IPluginSingleComponentProps> = (props) => {
    const { slotId, pluginId, children, ...otherProps } = props;

    const LoadedComponent = pluginRegistryUtils.getSlotComponent({ slotId, pluginId });

    if (LoadedComponent == null) {
        const renderFallback = children != null && isValidElement(children);

        return renderFallback ? cloneElement(children, { ...otherProps }) : null;
    }

    return <LoadedComponent {...otherProps} />;
};
