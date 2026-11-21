import {
    FloatingFocusManager,
    FloatingPortal,
    type UseFloatingReturn,
} from '@floating-ui/react';
import classNames from 'classnames';
import { type ComponentProps, forwardRef } from 'react';
import { KeyboardShortcut } from '../../keyboardShortcut';
import { useTranslations } from '../../translationsProvider';

export interface IAutocompleteInputMenuProps extends ComponentProps<'div'> {
    /**
     * Defines if the menu is open or not.
     */
    isOpen: boolean;
    /**
     * Context of the floating menu.
     */
    context: UseFloatingReturn['context'];
    /**
     * Label displayed on the menu footer.
     */
    selectItemLabel: string;
}

export const AutocompleteInputMenu = forwardRef<
    HTMLDivElement,
    IAutocompleteInputMenuProps
>((props, ref) => {
    const {
        isOpen,
        context,
        selectItemLabel,
        children,
        className,
        ...otherProps
    } = props;

    const { t } = useTranslations();

    const isBottomPlacement = context.placement === 'bottom';

    const menuClassName = classNames(
        'pointer-events-auto flex flex-col gap-related overflow-hidden border-x border-primary-400 bg-neutral-0 shadow-primary-lg outline-none',
        'z-[var(--guk-dropdown-container-content-z-index)]',
        {
            'rounded-b-xl border-b pt-inset-tight--fixed-4 md:pb-12':
                isBottomPlacement,
        },
        {
            'rounded-t-xl border-t pb-inset-tight--fixed-4 md:pt-12':
                !isBottomPlacement,
        },
        className,
    );

    const footerClassName = classNames(
        'absolute left-0 hidden w-full flex-row justify-between px-inset-surface-wide py-inset-surface-flat--fixed-16 text-base leading-tight font-normal backdrop-blur-md md:flex',
        { 'bottom-0': isBottomPlacement },
        { 'top-0': !isBottomPlacement },
    );

    return (
        <FloatingPortal>
            {isOpen && (
                <FloatingFocusManager
                    context={context}
                    initialFocus={-1}
                    returnFocus={false}
                    visuallyHiddenDismiss={true}
                >
                    <div className={menuClassName} ref={ref} {...otherProps}>
                        <div
                            className="flex max-h-[268px] flex-col gap-related overflow-auto px-inset-flush--fixed-12"
                            onWheel={(event) => event.stopPropagation()}
                        >
                            {children}
                        </div>
                        <div className={footerClassName}>
                            <div className="flex flex-row items-center gap-tight">
                                <KeyboardShortcut>↑</KeyboardShortcut>
                                <KeyboardShortcut>↓</KeyboardShortcut>
                                <p className="text-neutral-500">
                                    {t(
                                        'app.shared.autocompleteInput.menu.select',
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-row items-center gap-tight">
                                <p className="text-neutral-500">
                                    {selectItemLabel}
                                </p>
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
