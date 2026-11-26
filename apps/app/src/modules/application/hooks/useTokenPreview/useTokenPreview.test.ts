import { renderHook } from '@testing-library/react';
import type {
    IDebugContext,
    IDebugContextControl,
} from '@/shared/components/debugProvider';
import * as debugProvider from '@/shared/components/debugProvider';
import { tokenPreviewUtils } from '../../utils/tokenPreviewUtils';
import { useTokenPreview } from './useTokenPreview';

describe('useTokenPreview', () => {
    const { axes, defaultMode } = tokenPreviewUtils;
    const mockRegisterControl = jest.fn();
    const mockUnregisterControl = jest.fn();
    const useDebugContextSpy = jest.spyOn(debugProvider, 'useDebugContext');

    beforeEach(() => {
        useDebugContextSpy.mockReturnValue({
            values: {},
            registerControl: mockRegisterControl,
            unregisterControl: mockUnregisterControl,
            controls: [],
            updateValue: jest.fn(),
        } as IDebugContext);
    });

    afterEach(() => {
        mockRegisterControl.mockReset();
        mockUnregisterControl.mockReset();
        useDebugContextSpy.mockReset();
        axes.forEach((axis) => tokenPreviewUtils.applyMode(axis, defaultMode));
    });

    const getRegisteredControls = (): IDebugContextControl[] =>
        mockRegisterControl.mock.calls.map(
            ([control]) => control as IDebugContextControl,
        );

    it('registers one select per axis, with the default mode first and the current mode selected', () => {
        const [mode] = axes[0].modes;
        tokenPreviewUtils.applyMode(axes[0], mode);

        renderHook(() => useTokenPreview());

        const controls = getRegisteredControls();
        expect(controls.map(({ label }) => label)).toEqual(
            axes.map(({ label }) => label),
        );
        expect(controls[0]).toEqual(
            expect.objectContaining({ type: 'select', value: mode }),
        );
        expect(controls[0].options?.map(({ value }) => value)).toEqual([
            defaultMode,
            ...axes[0].modes,
        ]);
    });

    it('applies the selected mode to its axis', () => {
        const [mode] = axes[0].modes;
        renderHook(() => useTokenPreview());

        getRegisteredControls()[0].onChange?.(mode);

        expect(tokenPreviewUtils.getCurrentMode(axes[0])).toEqual(mode);
    });

    it('unregisters every control on unmount', () => {
        const { unmount } = renderHook(() => useTokenPreview());
        // The hook of the previous test unmounts after its mocks are reset.
        mockUnregisterControl.mockClear();
        unmount();

        expect(mockUnregisterControl.mock.calls.flat()).toEqual(
            getRegisteredControls().map(({ name }) => name),
        );
    });
});
