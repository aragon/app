import { Icon } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ComponentProps, forwardRef } from 'react';
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
    const { id, icon, name, description } = item;

    const itemClassName = classNames(
        'flex flex-row items-center justify-between rounded-lg gap-4 p-3 hover:cursor-pointer',
        { 'bg-neutral-50 text-neutral-800': isActive },
        { 'text-neutral-500': !isActive },
        className,
    );

    return (
        <div ref={ref} className={itemClassName} role="option" id={id} aria-selected={isActive} {...otherProps}>
            <span className="flex min-w-0 flex-row items-center gap-4">
                <Icon icon={icon} className={classNames({ 'text-neutral-300': !isActive })} />
                <p className="text-base leading-tight font-normal">{name}</p>
            </span>
            {description && <span className="text-sm leading-tight font-normal">{description}</span>}
        </div>
    );
});

AutocompleteInputItem.displayName = 'AutocompleteInputItem';
