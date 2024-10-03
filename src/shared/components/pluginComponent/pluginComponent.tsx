import { pluginRegistryUtils, type PluginId, type SlotId } from '@/shared/utils/pluginRegistryUtils';
import { cloneElement, isValidElement, type ReactNode } from 'react';

/**
 * @deprecated Use IPluginSingleComponentProps instead to properly support multi-plugin DAOs.
 */
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
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
    /**
     * Fallback component to be rendered if no components are registered for the specified slot.
     */
    children?: ReactNode;
}

/**
 * @deprecated Use PluginSingleComponent instead to properly support multi-plugin DAOs.
 */
export const PluginComponent: React.FC<IPluginComponentProps> = (props) => {
    const { slotId, pluginIds, children, ...otherProps } = props;

    const LoadedComponent = pluginIds
        .map((pluginId) => pluginRegistryUtils.getSlotComponent({ slotId, pluginId }))
        .find((component) => component != null);

    if (LoadedComponent == null) {
        const renderFallback = children != null && isValidElement(children);

        return renderFallback ? cloneElement(children, { ...otherProps }) : null;
    }

    return <LoadedComponent {...otherProps} />;
};
