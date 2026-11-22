import { ToggleGroupItem as RadixToggle } from '@radix-ui/react-toggle-group';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IToggleProps extends Omit<ComponentProps<'button'>, 'ref'> {
    /**
     * Value of the toggle.
     */
    value: string;
    /**
     * Label of the toggle.
     */
    label: string;
}

/**
 * The Toggle component is a button that handles the "on" and "off" states.
 *
 * **NOTE**: The component must be used inside a `<ToggleGroup />` component in order to work properly.
 */
export const Toggle: React.FC<IToggleProps> = (props) => {
    const { className, label, value, disabled, ...otherProps } = props;

    const toggleClasses = classNames(
        'flex h-control-sm cursor-pointer items-center rounded-lg border px-control-md outline-hidden focus-ring transition-all ring-accent-focus md:h-control-md md:rounded-xl md:px-control-lg', // Default
        'data-state-off:enabled:shadow-surface-sm data-[state=off]:enabled:border-surface-default data-[state=off]:enabled:bg-surface-default data-[state=off]:enabled:text-surface-default', // Default state
        'data-[state=off]:hover:enabled:border-surface-hover data-[state=off]:hover:enabled:shadow-surface-default', // Default hover state
        'data-state-on:enabled:shadow-accent-sm data-[state=on]:enabled:border-surface-selected data-[state=on]:enabled:bg-surface-default data-[state=on]:enabled:text-surface-selected', // Active state
        'data-[state=on]:hover:enabled:shadow-accent-default', // Active hover state
        'disabled:cursor-default disabled:border-surface-disabled-toggle disabled:bg-surface-disabled disabled:text-surface-disabled', // Disabled state
        className,
    );

    return (
        <RadixToggle className={toggleClasses} disabled={disabled} value={value} {...otherProps}>
            <p className="text-sm leading-normal font-normal md:text-base">{label}</p>
        </RadixToggle>
    );
};
