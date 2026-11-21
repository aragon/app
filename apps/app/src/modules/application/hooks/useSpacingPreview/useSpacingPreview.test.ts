import { renderHook } from '@testing-library/react';
import type {
    IDebugContext,
    IDebugContextControl,
} from '@/shared/components/debugProvider';
import * as debugProvider from '@/shared/components/debugProvider';
import { spacingPreviewUtils } from '../../utils/spacingPreviewUtils';
import { useSpacingPreview } from './useSpacingPreview';

describe('useSpacingPreview', () => {
    const mockRegisterControl = jest.fn();
    const mockUnregisterControl = jest.fn();
    const useDebugContextSpy = jest.spyOn(debugProvider, 'useDebugContext');
    const applySpacingSpy = jest.spyOn(spacingPreviewUtils, 'applySpacing');
    const getCurrentSpacingSpy = jest.spyOn(
        spacingPreviewUtils,
        'getCurrentSpacing',
    );

    beforeEach(() => {
        useDebugContextSpy.mockReturnValue({
            values: {},
            registerControl: mockRegisterControl,
            unregisterControl: mockUnregisterControl,
            controls: [],
            updateValue: jest.fn(),
        } as IDebugContext);
        applySpacingSpy.mockImplementation(() => null);
        getCurrentSpacingSpy.mockReturnValue('looser');
    });

    afterEach(() => {
        mockRegisterControl.mockReset();
        mockUnregisterControl.mockReset();
        useDebugContextSpy.mockReset();
        applySpacingSpy.mockReset();
        getCurrentSpacingSpy.mockReset();
    });

    const getRegisteredControl = (): IDebugContextControl =>
        mockRegisterControl.mock.calls[0][0] as IDebugContextControl;

    it('registers a Today / New / looser / compact select initialised with the current spacing', () => {
        renderHook(() => useSpacingPreview());

        const control = getRegisteredControl();
        expect(control).toEqual(
            expect.objectContaining({
                name: 'spacingPreview',
                type: 'select',
                label: 'Spacing (GovKit preview)',
                group: 'Design system',
                value: 'looser',
            }),
        );
        expect(control.options?.map(({ value }) => value)).toEqual([
            'today',
            'new',
            'looser',
            'compact',
        ]);
    });

    it('applies a known spacing on change and ignores other values', () => {
        renderHook(() => useSpacingPreview());

        const { onChange } = getRegisteredControl();
        onChange?.('compact');
        onChange?.('dense');

        expect(applySpacingSpy).toHaveBeenCalledTimes(1);
        expect(applySpacingSpy).toHaveBeenCalledWith('compact');
    });

    it('unregisters the control on unmount', () => {
        const { unmount } = renderHook(() => useSpacingPreview());
        unmount();

        expect(mockUnregisterControl).toHaveBeenCalledWith('spacingPreview');
    });
});
