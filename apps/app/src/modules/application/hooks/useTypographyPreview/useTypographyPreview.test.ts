import { renderHook } from '@testing-library/react';
import type {
    IDebugContext,
    IDebugContextControl,
} from '@/shared/components/debugProvider';
import * as debugProvider from '@/shared/components/debugProvider';
import { typographyPreviewUtils } from '../../utils/typographyPreviewUtils';
import { useTypographyPreview } from './useTypographyPreview';

describe('useTypographyPreview', () => {
    const mockRegisterControl = jest.fn();
    const mockUnregisterControl = jest.fn();
    const useDebugContextSpy = jest.spyOn(debugProvider, 'useDebugContext');
    const applyTypographySpy = jest.spyOn(
        typographyPreviewUtils,
        'applyTypography',
    );
    const getCurrentTypographySpy = jest.spyOn(
        typographyPreviewUtils,
        'getCurrentTypography',
    );

    beforeEach(() => {
        useDebugContextSpy.mockReturnValue({
            values: {},
            registerControl: mockRegisterControl,
            unregisterControl: mockUnregisterControl,
            controls: [],
            updateValue: jest.fn(),
        } as IDebugContext);
        applyTypographySpy.mockImplementation(() => null);
        getCurrentTypographySpy.mockReturnValue('next');
    });

    afterEach(() => {
        mockRegisterControl.mockReset();
        mockUnregisterControl.mockReset();
        useDebugContextSpy.mockReset();
        applyTypographySpy.mockReset();
        getCurrentTypographySpy.mockReset();
    });

    const getRegisteredControl = (): IDebugContextControl =>
        mockRegisterControl.mock.calls[0][0] as IDebugContextControl;

    it('registers a Today / Next select initialised with the current typography', () => {
        renderHook(() => useTypographyPreview());

        const control = getRegisteredControl();
        expect(control).toEqual(
            expect.objectContaining({
                name: 'typographyPreview',
                type: 'select',
                label: 'Typography (GovKit preview)',
                value: 'next',
            }),
        );
        expect(control.options?.map(({ value }) => value)).toEqual([
            'today',
            'next',
        ]);
    });

    it('applies a known typography on change and ignores other values', () => {
        renderHook(() => useTypographyPreview());

        const { onChange } = getRegisteredControl();
        onChange?.('next');
        onChange?.('dark');

        expect(applyTypographySpy).toHaveBeenCalledTimes(1);
        expect(applyTypographySpy).toHaveBeenCalledWith('next');
    });

    it('unregisters the control on unmount', () => {
        const { unmount } = renderHook(() => useTypographyPreview());
        unmount();

        expect(mockUnregisterControl).toHaveBeenCalledWith('typographyPreview');
    });
});
