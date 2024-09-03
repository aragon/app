import {
    autoUpdate,
    flip,
    type MiddlewareState,
    size,
    useDismiss,
    useFloating,
    useInteractions,
    useListNavigation,
    useRole,
} from '@floating-ui/react';
import { type ComponentProps, useRef } from 'react';
import type { IAutocompleteInputItem } from './autocompleteInput.api';

export interface IUseAutocompletePropsParams {
    /**
     * Defines if the autocomplete menu is open or not.
     */
    isOpen?: boolean;
    /**
     * Callback called on autocomplete menu open or close.
     */
    onOpenChange: (open: boolean) => void;
    /**
     * Current active index.
     */
    activeIndex: number | null;
    /**
     * Callback to updated the current active index.
     */
    setActiveIndex: (index: number | null) => void;
    /**
     * Callback called on item selected.
     */
    onItemSelected: (item: IAutocompleteInputItem) => void;
}

export const useAutocompleteProps = (params: IUseAutocompletePropsParams) => {
    const { isOpen, onOpenChange, activeIndex, setActiveIndex, onItemSelected } = params;

    const listRef = useRef<Array<HTMLElement | null>>([]);

    const updateFloatingStyle = (params: MiddlewareState) => {
        const { elements } = params;
        const inputWrapperWidth = (elements.reference as Element).parentElement?.offsetWidth;
        Object.assign(elements.floating.style, { width: `${inputWrapperWidth}px` });
    };

    const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
        whileElementsMounted: autoUpdate,
        open: isOpen,
        onOpenChange,
        middleware: [flip({ padding: 10 }), size({ apply: updateFloatingStyle, padding: 10 })],
    });

    const role = useRole(context, { role: 'listbox' });
    const dismiss = useDismiss(context);

    const listNavParams = { listRef, activeIndex, onNavigate: setActiveIndex, virtual: true, loop: true };
    const listNav = useListNavigation(context, listNavParams);

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([role, dismiss, listNav]);

    const floatingMenuProps = getFloatingProps({ ref: refs.setFloating, style: floatingStyles });

    const inputProps: ComponentProps<'input'> = getReferenceProps({ ref: refs.setReference });

    const handleItemSelected = (item: IAutocompleteInputItem) => {
        onItemSelected?.(item);
        refs.domReference.current?.focus();
    };

    const getMenuItemProps = (item: IAutocompleteInputItem & { index: number }) => {
        const updateListRef = (node: HTMLElement | null) => {
            listRef.current[item.index] = node;
        };

        return getItemProps({ onClick: () => handleItemSelected(item), ref: updateListRef });
    };

    return { inputProps, floatingMenuProps, getMenuItemProps, context };
};
