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
        'flex h-control-sm cursor-pointer items-center rounded-lg border px-control-md outline-hidden transition-all focus-ring-primary md:h-control-md md:rounded-xl md:px-control-lg', // Default
        'data-state-off:enabled:shadow-neutral-sm data-[state=off]:enabled:border-neutral-100 data-[state=off]:enabled:bg-neutral-0 data-[state=off]:enabled:text-neutral-500', // Default state
        'data-[state=off]:hover:enabled:border-neutral-200 data-[state=off]:hover:enabled:shadow-neutral', // Default hover state
        'data-state-on:enabled:shadow-primary-sm data-[state=on]:enabled:border-primary-400 data-[state=on]:enabled:bg-neutral-0 data-[state=on]:enabled:text-primary-400', // Active state
        'data-[state=on]:hover:enabled:shadow-primary', // Active hover state
        'disabled:cursor-default disabled:border-neutral-100 disabled:bg-neutral-100 disabled:text-neutral-300', // Disabled state
        className,
    );

    return (
        <RadixToggle className={toggleClasses} disabled={disabled} value={value} {...otherProps}>
            <p className="text-sm leading-normal font-normal md:text-base">{label}</p>
        </RadixToggle>
    );
};
