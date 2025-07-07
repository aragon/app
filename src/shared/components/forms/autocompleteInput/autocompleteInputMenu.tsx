import { FloatingFocusManager, FloatingPortal, type UseFloatingReturn } from '@floating-ui/react';
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

export const AutocompleteInputMenu = forwardRef<HTMLDivElement, IAutocompleteInputMenuProps>((props, ref) => {
    const { isOpen, context, selectItemLabel, children, className, ...otherProps } = props;

    const { t } = useTranslations();

    const isBottomPlacement = context.placement === 'bottom';

    const menuClassName = classNames(
        'flex flex-col gap-3 overflow-hidden border-x border-primary-400 bg-neutral-0 shadow-primary-lg outline-none',
        { 'rounded-b-xl border-b pt-1 md:pb-12': isBottomPlacement },
        { 'rounded-t-xl border-t pb-1 md:pt-12': !isBottomPlacement },
        className,
    );

    const footerClassName = classNames(
        'absolute left-0 hidden w-full flex-row justify-between px-6 py-4 text-base font-normal leading-tight backdrop-blur-md md:flex',
        { 'bottom-0': isBottomPlacement },
        { 'top-0': !isBottomPlacement },
    );

    return (
        <FloatingPortal>
            {isOpen && (
                <FloatingFocusManager
                    context={context}
                    initialFocus={-1}
                    visuallyHiddenDismiss={true}
                    returnFocus={false}
                >
                    <div className={menuClassName} ref={ref} {...otherProps}>
                        <div className="flex max-h-[268px] flex-col gap-3 overflow-auto px-3">{children}</div>
                        <div className={footerClassName}>
                            <div className="flex flex-row items-center gap-1">
                                <KeyboardShortcut>↑</KeyboardShortcut>
                                <KeyboardShortcut>↓</KeyboardShortcut>
                                <p className="text-neutral-500">{t('app.shared.autocompleteInput.menu.select')}</p>
                            </div>
                            <div className="flex flex-row items-center gap-1">
                                <p className="text-neutral-500">{selectItemLabel}</p>
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
