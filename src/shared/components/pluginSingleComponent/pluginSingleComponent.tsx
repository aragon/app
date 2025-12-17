'use client';

import classNames from 'classnames';
import { type PluginId, pluginRegistryUtils, type SlotId } from '@/shared/utils/pluginRegistryUtils';
import { useDebugContext } from '../debugProvider';

export type FallbackComponent<TProps = Record<string, unknown>> = React.FC<TProps>;

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

    const { values } = useDebugContext<{ highlightSlots: boolean }>();
    const { highlightSlots } = values;

    const LoadedComponent = pluginRegistryUtils.getSlotComponent({
        slotId,
        pluginId,
    });

    if (LoadedComponent == null && Fallback == null) {
        return null;
    }

    return (
        <div
            className={classNames('w-full', {
                'relative rounded-md border border-primary-400': highlightSlots,
            })}
        >
            {highlightSlots && (
                <p className="absolute -top-6 right-0 z-50 text-neutral-500">
                    {slotId} ({pluginId})
                </p>
            )}
            {LoadedComponent == null && Fallback != null && <Fallback {...otherProps} />}
            {LoadedComponent != null && <LoadedComponent {...otherProps} />}
        </div>
    );
};
