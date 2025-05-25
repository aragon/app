import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';
import { ToggleGroupItem as RadixToggle } from '@radix-ui/react-toggle-group';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface ITokenVoteOptionToggleProps extends Omit<ComponentProps<'button'>, 'ref'> {
    /**
     * Value of the toggle.
     */
    value: string;
    /**
     * Label of the toggle.
     */
    label: string;
    /**
     * Additional text to the main label.
     */
    description?: string;
    /**
     * Variant of the toggle.
     * @default neutral
     */
    variant?: 'success' | 'neutral' | 'critical';
    /**
     * Is the toggle selected.
     */
    isSelected: boolean;
}

/**
 *
 * **NOTE**: The component must be used inside a `<ToggleGroup />` component in order to work properly.
 */
export const TokenVoteOptionToggle: React.FC<ITokenVoteOptionToggleProps> = (props) => {
    const { className, label, description, value, disabled, variant = 'neutral', isSelected, ...otherProps } = props;

    // Cover the following states and variants:
    // changing elements: shadow, border, label, description, icon
    // states: default, focus, hover, active
    // variants: success, neutral, critical

    const successClasses = classNames(
        'active:border-success-500 active:shadow-none',
        'data-[state=on]:border-success-300 data-[state=on]:text-success-800 data-[state=on]:shadow-success-sm',
    );
    const neutralClasses = classNames(
        'active:border-primary-400 active:shadow-none',
        'data-[state=on]:border-primary-300 data-[state=on]:text-neutral-800 data-[state=on]:shadow-primary-sm',
    );
    const criticalClasses = classNames(
        'active:border-critical-500 active:shadow-none',
        'data-[state=on]:border-critical-300 data-[state=on]:text-critical-800 data-[state=on]:shadow-critical-sm',
    );

    const toggleClasses = classNames(
        'flex items-center justify-between gap-3 rounded-xl border py-2 pl-4 pr-3',
        // 'outline-hidden cursor-pointer bg-neutral-0 transition-all focus-visible:ring-primary',
        'focus:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-3',
        'border-neutral-100 text-neutral-500 shadow-neutral-sm',
        'hover:border-neutral-200 hover:shadow-neutral',
        variant === 'success' && successClasses,
        variant === 'neutral' && neutralClasses,
        variant === 'critical' && criticalClasses,
        className,
    );

    return (
        <RadixToggle className={toggleClasses} disabled={disabled} value={value} {...otherProps}>
            <p className="text-sm leading-tight font-normal md:text-base">
                {label}
                {description && <span className="text-neutral-500">{description}</span>}
            </p>
            {variant === 'success' && (
                <AvatarIcon icon={IconType.CHECKMARK} size="sm" variant={isSelected ? 'success' : 'neutral'} />
            )}
            {variant === 'neutral' && (
                <AvatarIcon icon={IconType.RADIO} size="sm" variant={isSelected ? 'primary' : 'neutral'} />
            )}
            {variant === 'critical' && (
                <AvatarIcon icon={IconType.CLOSE} size="sm" variant={isSelected ? 'critical' : 'neutral'} />
            )}
        </RadixToggle>
    );
};
