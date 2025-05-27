import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';
import { ToggleGroupItem as RadixToggle } from '@radix-ui/react-toggle-group';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export type TokenVotingOptionToggleVariant = 'success' | 'neutral' | 'critical';

export interface ITokenVotingOptionToggleProps extends Omit<ComponentProps<'button'>, 'ref'> {
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
    variant?: TokenVotingOptionToggleVariant;
    /**
     * Is the toggle selected.
     */
    isSelected: boolean;
}

const variantToClassNames: Record<TokenVotingOptionToggleVariant, string[]> = {
    success: [
        'active:border-success-500',
        'data-[state=on]:border-success-300 data-[state=on]:text-success-800 data-[state=on]:shadow-success-sm',
    ],
    neutral: [
        'active:border-primary-400',
        'data-[state=on]:border-primary-300 data-[state=on]:text-neutral-800 data-[state=on]:shadow-primary-sm',
    ],
    critical: [
        'active:border-critical-500',
        'data-[state=on]:border-critical-300 data-[state=on]:text-critical-800 data-[state=on]:shadow-critical-sm',
    ],
};

const variantToIcon: Record<TokenVotingOptionToggleVariant, IconType> = {
    success: IconType.CHECKMARK,
    neutral: IconType.RADIO,
    critical: IconType.CLOSE,
};

const variantToIconVariant: Record<TokenVotingOptionToggleVariant, 'success' | 'primary' | 'critical'> = {
    success: 'success',
    neutral: 'primary',
    critical: 'critical',
};

/**
 * **NOTE**: The component must be used inside a `<ToggleGroup />` component in order to work properly.
 */
export const TokenVotingOptionToggle: React.FC<ITokenVotingOptionToggleProps> = (props) => {
    const { className, label, description, value, disabled, variant = 'neutral', isSelected, ...otherProps } = props;

    const toggleClasses = classNames(
        'flex items-center justify-between gap-3 rounded-xl border py-2 pl-4 pr-3 h-[50px]',
        'cursor-pointer bg-neutral-0 transition-all',
        'border-neutral-100 text-neutral-500 shadow-neutral-sm focus-ring-primary',
        'active:shadow-none',
        'hover:border-neutral-200 hover:shadow-neutral',
        variantToClassNames[variant],
        className,
    );

    return (
        <RadixToggle className={toggleClasses} disabled={disabled} value={value} {...otherProps}>
            <p className="text-sm leading-tight font-normal md:text-base">
                {label}
                {description && <span className="text-neutral-500">{description}</span>}
            </p>
            <AvatarIcon
                icon={variantToIcon[variant]}
                variant={isSelected ? variantToIconVariant[variant] : 'neutral'}
                size="sm"
            />
        </RadixToggle>
    );
};
