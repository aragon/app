import { type PluginFunction, pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { renderHook } from '@testing-library/react';
import { useSlotSingleFunction } from './useSlotSingleFunction';

describe('useSlotSingleFunction hook', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
    });

    it('returns the result for the registered slot function from the given plugin-id and slot-id`', () => {
        const params = 5;
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        const slotFunction: PluginFunction = (value: number) => value * 2;
        getSlotFunctionSpy.mockReturnValue(slotFunction);
        const { result } = renderHook(() => useSlotSingleFunction({ params, slotId, pluginId }));

        expect(getSlotFunctionSpy).toHaveBeenCalledWith({ slotId, pluginId });
        expect(result.current).toEqual(slotFunction(params));
    });

    it('returns undefined when no slot function is found', () => {
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        getSlotFunctionSpy.mockReturnValue(undefined);
        const { result } = renderHook(() => useSlotSingleFunction({ slotId, pluginId, params: {} }));
        expect(result.current).toBeUndefined();
    });
});
