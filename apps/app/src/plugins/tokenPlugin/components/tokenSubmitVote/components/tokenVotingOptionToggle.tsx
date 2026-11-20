import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';
import { ToggleGroupItem as RadixToggle } from '@radix-ui/react-toggle-group';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export type TokenVotingOptionToggleVariant = 'success' | 'neutral' | 'critical';

export interface ITokenVotingOptionToggleProps
    extends Omit<ComponentProps<'button'>, 'ref'> {
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
        'data-[state=on]:enabled:border-success-300 data-[state=on]:text-success-800 data-[state=on]:shadow-success-sm',
    ],
    neutral: [
        'active:border-accent-active',
        'data-[state=on]:enabled:border-primary-300 data-[state=on]:text-neutral-800 data-[state=on]:shadow-accent-sm',
    ],
    critical: [
        'active:border-critical-500',
        'data-[state=on]:enabled:border-critical-300 data-[state=on]:text-critical-800 data-[state=on]:shadow-critical-sm',
    ],
};

const variantToIcon: Record<TokenVotingOptionToggleVariant, IconType> = {
    success: IconType.CHECKMARK,
    neutral: IconType.RADIO,
    critical: IconType.CLOSE,
};

const variantToIconVariant: Record<
    TokenVotingOptionToggleVariant,
    'success' | 'primary' | 'critical'
> = {
    success: 'success',
    neutral: 'primary',
    critical: 'critical',
};

export const TokenVotingOptionToggle: React.FC<
    ITokenVotingOptionToggleProps
> = (props) => {
    const {
        className,
        label,
        description,
        value,
        disabled,
        variant = 'neutral',
        isSelected,
        ...otherProps
    } = props;

    const toggleClasses = classNames(
        'flex h-[50px] items-center justify-between gap-3 rounded-xl border py-2 pr-3 pl-4',
        'cursor-pointer bg-surface-default transition-all',
        'border-surface-default text-surface-default focus-ring ring-accent-focus shadow-surface-sm',
        'active:shadow-none',
        'hover:border-surface-hover hover:shadow-surface-default',
        'disabled:cursor-default disabled:border-neutral-100 disabled:bg-surface-disabled disabled:text-surface-disabled',
        variantToClassNames[variant],
        className,
    );

    return (
        <RadixToggle
            className={toggleClasses}
            disabled={disabled}
            value={value}
            {...otherProps}
        >
            <p className="text-sm leading-tight font-normal md:text-base">
                {label}
                {description && (
                    <span className="text-surface-secondary">
                        {description}
                    </span>
                )}
            </p>
            <AvatarIcon
                icon={variantToIcon[variant]}
                size="sm"
                variant={isSelected ? variantToIconVariant[variant] : 'neutral'}
            />
        </RadixToggle>
    );
};
