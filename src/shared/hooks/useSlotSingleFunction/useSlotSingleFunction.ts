import { type PluginId, type SlotId, pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';

export interface IUseSlotSingleFunctionParams<TParams, TResult> {
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
    /**
     * Fallback function to be executed if no slot function is registered.
     */
    defaultFn?: (params: TParams) => TResult;
}

export const useSlotSingleFunction = <TParams = unknown, TResult = unknown>(
    params: IUseSlotSingleFunctionParams<TParams, TResult>,
) => {
    const { params: functionParams, slotId, pluginId, defaultFn } = params;

    const slotFunction = pluginRegistryUtils.getSlotFunction<TParams, TResult>({ slotId, pluginId });

    if (slotFunction == null) {
        return defaultFn?.(functionParams);
    }

    const result = slotFunction(functionParams);

    return result;
};
