import { mergeRefs } from '@aragon/ods';
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
import { type ComponentProps, type ForwardedRef, type HTMLProps, useRef } from 'react';

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
     * Ref for the autocomplete input.
     */
    inputRef?: ForwardedRef<HTMLInputElement>;
}

export const useAutocompleteProps = (params: IUseAutocompletePropsParams) => {
    const { isOpen, onOpenChange, activeIndex, setActiveIndex, inputRef } = params;

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

    const combinedInputRefs = mergeRefs([refs.setReference, inputRef]);
    const inputProps: ComponentProps<'input'> = getReferenceProps({ ref: combinedInputRefs });

    const getMenuItemProps = (itemIndex: number, props: HTMLProps<HTMLElement>) => {
        const updateListRef = (node: HTMLElement | null) => {
            listRef.current[itemIndex] = node;
        };

        return getItemProps({ ref: updateListRef, ...props });
    };

    return { inputProps, floatingMenuProps, getMenuItemProps, context };
};
