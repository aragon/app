import { pluginUtils, type PluginId, type SlotId } from '@/shared/utils/pluginUtils';
import type { ReactNode } from 'react';

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
     * Fallback content displayed for unsupported plugins.
     */
    children?: ReactNode;
    /**
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
}

export const PluginComponent: React.FC<IPluginComponentProps> = (props) => {
    const { slotId, pluginId, children, ...otherProps } = props;

    const LoadedComponent = pluginUtils.getSlotComponent({
        slotId,
        pluginId,
    });

    return <>{LoadedComponent ? <LoadedComponent {...otherProps} /> : children}</>;
};
