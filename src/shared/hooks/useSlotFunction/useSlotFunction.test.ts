import { type PluginFunction, pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { renderHook } from '@testing-library/react';
import { useSlotFunction } from './useSlotFunction';

describe('useSlotFunction hook', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
    });

    it('returns the result for the registered slot function from the given plugin-id and slot-id`', () => {
        const params = 5;
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        const slotFunction = (value: number) => value * 2;
        getSlotFunctionSpy.mockReturnValue(slotFunction as PluginFunction);
        const { result } = renderHook(() => useSlotFunction({ params, slotId, pluginIds: [pluginId] }));

        expect(getSlotFunctionSpy).toHaveBeenCalledWith({ slotId, pluginId });
        expect(result.current).toEqual(slotFunction(params));
    });

    it('returns undefined when no slot function is found', () => {
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        getSlotFunctionSpy.mockReturnValue(undefined);
        const { result } = renderHook(() => useSlotFunction({ slotId, pluginIds: [pluginId], params: {} }));
        expect(result.current).toBeUndefined();
    });

    it('only returns the result of the first non-null slot function found', () => {
        const pluginIds = ['unknown', 'multisig', 'tokenVoting'];
        const slotId = 'member-stats';
        getSlotFunctionSpy
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(() => 'multisig-stats')
            .mockReturnValueOnce(() => 'token-voting-stats');
        const { result } = renderHook(() => useSlotFunction({ slotId, pluginIds, params: {} }));

        expect(result.current).toEqual('multisig-stats');
    });
});
