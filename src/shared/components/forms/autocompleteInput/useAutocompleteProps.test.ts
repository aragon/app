import { renderHook } from '@testing-library/react';
import { type IUseAutocompletePropsParams, useAutocompleteProps } from './useAutocompleteProps';

describe('useAutocompleteProps hook', () => {
    const generateParams = (params?: Partial<IUseAutocompletePropsParams>): IUseAutocompletePropsParams => ({
        onOpenChange: jest.fn(),
        activeIndex: null,
        setActiveIndex: jest.fn(),
        ...params,
    });

    it('returns correct props for autocomplete input component', () => {
        const { result } = renderHook(() => useAutocompleteProps(generateParams()));
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
        const { result } = renderHook(() => useAutocompleteProps(generateParams()));
        expect(result.current.floatingMenuProps).toEqual(
            expect.objectContaining({
                role: 'listbox',
                onKeyDown: expect.any(Function),
                onPointerMove: expect.any(Function),
            }),
        );
    });

    it('returns floating menu context', () => {
        const { result } = renderHook(() => useAutocompleteProps(generateParams()));
        expect(result.current.context.placement).toEqual('bottom');
        expect(result.current.context.refs).toBeDefined();
        expect(result.current.context.open).toBeFalsy();
    });

    it('returns a function to build the item-menu props', () => {
        const { result } = renderHook(() => useAutocompleteProps(generateParams()));
        const itemProps = result.current.getMenuItemProps(0, {});
        expect(itemProps).toEqual(
            expect.objectContaining({
                onFocus: expect.any(Function),
                onClick: expect.any(Function),
            }),
        );
    });
});
