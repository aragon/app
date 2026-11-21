import classNames from 'classnames';
import type React from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export interface IDropdownGroupProps extends ComponentPropsWithoutRef<'div'> {}

/**
 * Stacks dropdown triggers into one neutral bordered group.
 *
 * Usage notes:
 *
 * - Wrap direct `Dropdown.Container` children, or components that render them, to share one border,
 *   surface, rounding, and neutral dividers.
 * - Each child remains an independent Radix dropdown; the group provides presentation only and has no
 *   selection or accessibility semantics of its own.
 */
export const DropdownGroup: React.FC<IDropdownGroupProps> = (props) => {
    const { children, className, ...otherProps } = props;

    return (
        <div
            className={classNames(
                'flex flex-col gap-0 divide-y overflow-hidden rounded-xl border border-surface-secondary bg-surface-primary divide-border-surface-secondary',
                '[&_[data-guk-dropdown-trigger]]:rounded-none',
                '[&_[data-guk-dropdown-trigger]]:border-0',
                '[&_[data-guk-dropdown-trigger]]:shadow-none',
                '[&_[data-guk-dropdown-trigger]:focus-visible]:ring-inset',
                '[&_[data-guk-dropdown-trigger]:focus-visible]:ring-offset-0',
                className,
            )}
            {...otherProps}
        >
            {children}
        </div>
    );
};
