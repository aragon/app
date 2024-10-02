import { PluginId, type SlotId, pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';

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

export const useSlotSingleFunction = <TResult = unknown, TParams = unknown>(
    params: IUseSlotSingleFunctionParams<TParams>,
) => {
    const { params: functionParams, slotId, pluginId } = params;

    const slotFunction = pluginRegistryUtils.getSlotFunction<TParams, TResult>({ slotId, pluginId });
    const result = slotFunction?.(functionParams) as TResult | undefined;

    return result;
};
