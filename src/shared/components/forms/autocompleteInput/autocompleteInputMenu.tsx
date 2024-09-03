import { FloatingFocusManager, FloatingPortal, type UseFloatingReturn } from '@floating-ui/react';
import classNames from 'classnames';
import { type ComponentProps, forwardRef } from 'react';
import { KeyboardShortcut } from '../../keyboardShortcut';

export interface IAutocompleteInputMenuProps extends ComponentProps<'div'> {
    /**
     * Defines if the menu is open or not.
     */
    isOpen: boolean;
    /**
     * Context of the floating menu.
     */
    context: UseFloatingReturn['context'];
}

export const AutocompleteInputMenu = forwardRef<HTMLDivElement, IAutocompleteInputMenuProps>((props, ref) => {
    const { isOpen, context, children, ...otherProps } = props;
    const isBottomPlacement = context.placement === 'bottom';

    const menuClassName = classNames(
        'flex flex-col gap-3 overflow-hidden border-x border-primary-400 bg-neutral-0 shadow-primary-lg',
        { 'rounded-b-xl border-b pt-1 md:pb-12': isBottomPlacement },
        { 'rounded-t-xl border-t pb-1 md:pt-12': !isBottomPlacement },
    );

    const footerClassName = classNames(
        'absolute left-0 hidden w-full flex-row justify-between px-6 py-4 text-base font-normal leading-tight backdrop-blur-md md:flex',
        { 'bottom-0': isBottomPlacement },
        { 'top-0': !isBottomPlacement },
    );

    return (
        <FloatingPortal>
            {isOpen && (
                <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss={true}>
                    <div className={menuClassName} ref={ref} {...otherProps}>
                        <div className="flex max-h-[268px] flex-col overflow-auto px-3">{children}</div>
                        <div className={footerClassName}>
                            <div className="flex flex-row items-center gap-1">
                                <KeyboardShortcut>↑</KeyboardShortcut>
                                <KeyboardShortcut>↓</KeyboardShortcut>
                                <p className="text-neutral-500">Select</p>
                            </div>
                            <div className="flex flex-row items-center gap-1">
                                <p className="text-neutral-500">Add action</p>
                                <KeyboardShortcut>↵</KeyboardShortcut>
                            </div>
                        </div>
                    </div>
                </FloatingFocusManager>
            )}
        </FloatingPortal>
    );
});

AutocompleteInputMenu.displayName = 'AutocompleteInputMenu';
