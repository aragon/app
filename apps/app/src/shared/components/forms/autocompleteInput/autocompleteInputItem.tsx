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

export const AutocompleteInputItem = forwardRef<
    HTMLDivElement,
    IAutocompleteInputItemProps
>((props, ref) => {
    const { isActive, item, className, ...otherProps } = props;
    const { id, icon, name, info } = item;

    const itemClassName = classNames(
        'flex flex-row items-center justify-between gap-group rounded-lg px-inset-item-flat--fixed-12 py-control-item-flat--fixed-8 hover:cursor-pointer',
        { 'bg-surface-hover text-surface-hover-label': isActive },
        { 'text-surface-default': !isActive },
        className,
    );

    return (
        <div
            aria-selected={isActive}
            className={itemClassName}
            id={id}
            ref={ref}
            role="option"
            {...otherProps}
        >
            <span className="flex min-w-0 flex-row items-center gap-group">
                <Icon
                    className={classNames({
                        'icon-surface-default': !isActive,
                    })}
                    icon={icon}
                />
                <p className="type-control--tall-line">{name}</p>
            </span>
            <span className="flex items-center gap-related--fixed-8">
                {info && (
                    <span
                        className={classNames(
                            'type-supporting--compact-detail',
                            // biome-ignore lint/plugin/noPrimitiveSpacing: room for the check icon of the active item (icon + gap)
                            { 'mr-7': !isActive },
                        )}
                    >
                        {info}
                    </span>
                )}
                {isActive && <KeyboardShortcut>↵</KeyboardShortcut>}
            </span>
        </div>
    );
});

AutocompleteInputItem.displayName = 'AutocompleteInputItem';
