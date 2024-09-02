import { Icon } from '@aragon/ods';
import classNames from 'classnames';
import { ComponentProps, forwardRef } from 'react';
import { IAutocompleteInputItem } from './autocompleteInput.api';

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
    const { isActive, item, className, ...other } = props;
    const { id, icon, name } = item;

    return (
        <div
            ref={ref}
            className={classNames(
                'flex flex-row items-center gap-4 rounded-lg px-3 py-3 hover:cursor-pointer',
                { 'bg-neutral-50 text-neutral-800': isActive },
                className,
            )}
            role="option"
            id={id}
            aria-selected={isActive}
            {...other}
        >
            <Icon icon={icon} className={classNames({ 'text-neutral-300': !isActive })} />
            <p className={classNames('text-base font-normal leading-tight', { 'text-neutral-500': !isActive })}>
                {name}
            </p>
        </div>
    );
});
