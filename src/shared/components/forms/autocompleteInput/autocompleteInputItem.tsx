import { Icon } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ComponentProps, forwardRef } from 'react';
import { KeyboardShortcut } from '../../keyboardShortcut';
import type { IAutocompleteInputItem } from './autocompleteInput.api';

export interface IAutocompleteInputItemProps extends ComponentProps<'div'> {
    /**
     * Item to be rendered.
     */
    item: IAutocompleteInputItem;
    /**
     * Defines if the item is active or not.
     */
    isActive: boolean;
}

export const AutocompleteInputItem = forwardRef<HTMLDivElement, IAutocompleteInputItemProps>((props, ref) => {
    const { isActive, item, className, ...otherProps } = props;
    const { id, icon, name, info } = item;

    const itemClassName = classNames(
        'flex flex-row items-center justify-between rounded-lg gap-4 px-3 py-2 hover:cursor-pointer',
        'leading-tight font-normal',
        { 'bg-neutral-50 text-neutral-800': isActive },
        { 'text-neutral-500': !isActive },
        className
    );

    return (
        <div aria-selected={isActive} className={itemClassName} id={id} ref={ref} role="option" tabIndex={0} {...otherProps}>
            <span className="flex min-w-0 flex-row items-center gap-4">
                <Icon className={classNames({ 'text-neutral-300': !isActive })} icon={icon} />
                <p className="text-base">{name}</p>
            </span>
            <span className="flex items-center gap-2">
                {info && <span className={classNames('text-sm', { 'mr-7': !isActive })}>{info}</span>}
                {isActive && <KeyboardShortcut>↵</KeyboardShortcut>}
            </span>
        </div>
    );
});

AutocompleteInputItem.displayName = 'AutocompleteInputItem';
