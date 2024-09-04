import { renderHook } from '@testing-library/react';
import { IUseAutocompletePropsParams, useAutocompleteProps } from './useAutocompleteProps';

describe('useAutocompleteProps hook', () => {
    const renderTestHook = (params?: Partial<IUseAutocompletePropsParams>) => {
        const completeParams: IUseAutocompletePropsParams = {
            onOpenChange: jest.fn(),
            activeIndex: null,
            setActiveIndex: jest.fn(),
            ...params,
        };

        return useAutocompleteProps(completeParams);
    };

    it('returns correct props for autocomplete input component', () => {
        const { result } = renderHook(() => renderTestHook());
        expect(result.current.inputProps).toEqual(
            expect.objectContaining({
                role: 'combobox',
                onKeyDown: expect.any(Function),
                onFocus: expect.any(Function),
                onClick: expect.any(Function),
            }),
        );
    });

    it('returns correct props for autocomplete floating menu', () => {
        const { result } = renderHook(() => renderTestHook());
        expect(result.current.floatingMenuProps).toEqual(
            expect.objectContaining({
                role: 'listbox',
                onKeyDown: expect.any(Function),
                onPointerMove: expect.any(Function),
            }),
        );
    });

    it('returns floating menu context', () => {
        const { result } = renderHook(() => renderTestHook());
        expect(result.current.context).toBeDefined();
    });

    it('returns a function to build the item-menu props', () => {
        const { result } = renderHook(() => renderTestHook());
        const itemProps = result.current.getMenuItemProps(0, {});
        expect(itemProps).toEqual(
            expect.objectContaining({
                onFocus: expect.any(Function),
                onClick: expect.any(Function),
            }),
        );
    });
});
