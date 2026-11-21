import { renderHook } from '@testing-library/react';
import type {
    IDebugContext,
    IDebugContextControl,
} from '@/shared/components/debugProvider';
import * as debugProvider from '@/shared/components/debugProvider';
import { themePreviewUtils } from '../../utils/themePreviewUtils';
import { useThemePreview } from './useThemePreview';

describe('useThemePreview', () => {
    const mockRegisterControl = jest.fn();
    const mockUnregisterControl = jest.fn();
    const useDebugContextSpy = jest.spyOn(debugProvider, 'useDebugContext');
    const applyThemeSpy = jest.spyOn(themePreviewUtils, 'applyTheme');
    const getCurrentThemeSpy = jest.spyOn(themePreviewUtils, 'getCurrentTheme');

    beforeEach(() => {
        useDebugContextSpy.mockReturnValue({
            values: {},
            registerControl: mockRegisterControl,
            unregisterControl: mockUnregisterControl,
            controls: [],
            updateValue: jest.fn(),
        } as IDebugContext);
        applyThemeSpy.mockImplementation(() => null);
        getCurrentThemeSpy.mockReturnValue('next');
    });

    afterEach(() => {
        mockRegisterControl.mockReset();
        mockUnregisterControl.mockReset();
        useDebugContextSpy.mockReset();
        applyThemeSpy.mockReset();
        getCurrentThemeSpy.mockReset();
    });

    const getRegisteredControl = (): IDebugContextControl =>
        mockRegisterControl.mock.calls[0][0] as IDebugContextControl;

    it('registers a Today / Next / Dark select initialised with the current theme', () => {
        renderHook(() => useThemePreview());

        const control = getRegisteredControl();
        expect(control).toEqual(
            expect.objectContaining({
                name: 'themePreview',
                type: 'select',
                value: 'next',
            }),
        );
        expect(control.options?.map(({ value }) => value)).toEqual([
            'today',
            'next',
            'dark',
        ]);
        expect(control.description).toMatch(/not themed yet/);
    });

    it('applies a known theme on change and ignores other values', () => {
        renderHook(() => useThemePreview());

        const { onChange } = getRegisteredControl();
        onChange?.('dark');
        onChange?.('purple');

        expect(applyThemeSpy).toHaveBeenCalledTimes(1);
        expect(applyThemeSpy).toHaveBeenCalledWith('dark');
    });

    it('unregisters the control on unmount', () => {
        const { unmount } = renderHook(() => useThemePreview());
        unmount();

        expect(mockUnregisterControl).toHaveBeenCalledWith('themePreview');
    });
});
