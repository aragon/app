import { type PluginId, type SlotId, pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';

export interface IUseSlotSingleFunctionParams<TParams> {
    /**
     * Slot ID to load the slot-function.
     */
    slotId: SlotId;
    /**
     * ID of the plugin to load the slot-function.
     */
    pluginId: PluginId;
    /**
     * Parameters to be passed to the slot function.
     */
    params: TParams;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const useSlotSingleFunction = <TParams = unknown, TResult = unknown>(
    params: IUseSlotSingleFunctionParams<TParams>,
) => {
    const { params: functionParams, slotId, pluginId } = params;

    const slotFunction = pluginRegistryUtils.getSlotFunction<TParams, TResult>({ slotId, pluginId });
    const result = slotFunction?.(functionParams);

    return result;
};
