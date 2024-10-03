import { type SlotId, pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';

/**
 * @deprecated Use IUseSlotSingleFunctionParams instead to properly support multi-plugin DAOs.
 */
export interface IUseSlotFunctionParams<TParams> {
    /**
     * Parameters to be passed to the slot function.
     */
    params: TParams;
    /**
     * Slot ID to load the slot-function.
     */
    slotId: SlotId;
    /**
     * IDs of the plugins to load the slot-function.
     */
    pluginIds: string[];
}

/**
 * @deprecated Use useSlotSingleFunction instead to properly support multi-plugin DAOs.
 */
export const useSlotFunction = <TResult = unknown, TParams = unknown>(params: IUseSlotFunctionParams<TParams>) => {
    const { params: functionParams, slotId, pluginIds } = params;

    const slotFunction = pluginIds
        .map((pluginId) => pluginRegistryUtils.getSlotFunction<TParams, TResult>({ slotId, pluginId }))
        .find((slotFunction) => slotFunction != null);

    const result = slotFunction?.(functionParams) as TResult | undefined;

    return result;
};
