import classNames from 'classnames';
import { forwardRef, type MouseEvent, type Ref } from 'react';
import type { Breakpoint, ResponsiveAttribute, ResponsiveAttributeClassMap } from '../../types';
import { responsiveUtils } from '../../utils';
import { Icon, type IconSize } from '../icon';
import { LinkBase } from '../link';
import { Spinner } from '../spinner';
import type { SpinnerSize, SpinnerVariant } from '../spinner/spinner';
import type { ButtonContext, ButtonSize, ButtonVariant, IButtonProps } from './button.api';

// Colours come from the semantic colour tokens (src/theme/tokens/semantic), bound as in the Figma Button component.
// Using aria-disabled: instead of disabled: modifier in order to make the modifier work for buttons and links.
// Where Figma has no stroke (primary, disabled) the 1px border follows the fill through the border-*-fill aliases.
const disabledClassNames =
    'aria-disabled:bg-surface-disabled aria-disabled:text-surface-disabled aria-disabled:border-surface-fill-disabled';

const variantToClassNames: Record<ButtonVariant, string[]> = {
    primary: [
        'bg-accent-default text-accent-inverse border-accent-fill shadow-accent-sm', // Default
        'hover:bg-accent-hover hover:border-accent-fill-hover hover:shadow-accent-default', // Hover
        'active:bg-accent-active active:border-accent-fill-active focus-ring focus-visible:ring-accent-focus', // Active / Focus
        disabledClassNames, // Disabled
    ],
    secondary: [
        'bg-accent-default-inverse text-accent-default border-accent-default shadow-accent-sm', // Default
        'hover:border-accent-hover hover:bg-accent-hover-inverse hover:text-accent-hover hover:shadow-accent-default', // Hover
        'active:border-accent-active active:bg-accent-active-inverse active:text-accent-active focus-ring focus-visible:ring-accent-focus', // Active / Focus
        disabledClassNames, // Disabled
    ],
    tertiary: [
        'bg-surface-default text-surface-default border-surface-default shadow-surface-sm', // Default
        'hover:bg-surface-hover hover:border-surface-hover hover:text-surface-hover hover:shadow-surface-default', // Hover
        'active:bg-surface-active active:border-surface-active active:text-surface-active focus-ring focus-visible:ring-accent-focus', // Active / Focus
        disabledClassNames, // Disabled
    ],
    ghost: [
        // Figma binds the ghost background to bg/body; it stays transparent so the button keeps working on any surface.
        'bg-transparent border-transparent text-accent-default', // Default
        // Hover stays white as before the semantic tokens (Figma binds bg/surface/hover); see bg/surface/ghost-hover.
        'hover:bg-surface-ghost-hover hover:text-accent-hover', // Hover
        'active:bg-surface-active active:text-accent-active focus-ring focus-visible:ring-accent-focus', // Active / Focus
        'aria-disabled:text-surface-disabled', // Disabled
    ],
    success: [
        'bg-success-default text-success-default border-success-default shadow-success-sm', // Default
        'hover:bg-success-hover hover:border-success-hover hover:text-success-hover hover:shadow-success-default', // Hover
        'active:bg-success-active active:border-success-active active:text-success-active focus-ring focus-visible:ring-success-focus', // Active / Focus
        disabledClassNames, // Disabled
    ],
    warning: [
        'bg-warning-default text-warning-default border-warning-default shadow-warning-sm', // Default
        'hover:bg-warning-hover hover:border-warning-hover hover:text-warning-hover hover:shadow-warning-default', // Hover
        'active:bg-warning-active active:border-warning-active active:text-warning-active focus-ring focus-visible:ring-warning-focus', // Active / Focus
        disabledClassNames, // Disabled
    ],
    critical: [
        'bg-critical-default text-critical-default border-critical-default shadow-critical-sm', // Default
        'hover:bg-critical-hover hover:border-critical-hover hover:text-critical-hover hover:shadow-critical-default', // Hover
        'active:bg-critical-active active:border-critical-active active:text-critical-active focus-ring focus-visible:ring-critical-focus', // Active / Focus
        disabledClassNames, // Disabled
    ],
};

const variantToIconClassNames: Record<ButtonVariant, string> = {
    primary: 'icon-accent-inverse',
    secondary: 'icon-accent-default group-hover:icon-accent-hover group-active:icon-accent-active',
    tertiary: 'icon-surface-default group-hover:icon-surface-hover group-active:icon-surface-active',
    ghost: 'icon-accent-default group-hover:icon-accent-hover group-active:icon-accent-active',
    success: 'icon-success-default group-hover:icon-success-hover group-active:icon-success-active',
    warning: 'icon-warning-default group-hover:icon-warning-hover group-active:icon-warning-active',
    critical: 'icon-critical-default group-hover:icon-critical-hover group-active:icon-critical-active',
};

const variantToSpinnerVariant: Record<ButtonVariant, SpinnerVariant> = {
    primary: 'primaryInverted',
    secondary: 'primary',
    tertiary: 'neutral',
    ghost: 'primary',
    success: 'success',
    warning: 'warning',
    critical: 'critical',
};

const responsiveSizeClassNames: ResponsiveAttributeClassMap<ButtonSize> = {
    sm: {
        default: 'h-8 text-sm rounded-lg gap-0.5',
        sm: 'sm:h-8 sm:text-sm sm:rounded-lg sm:gap-0.5',
        md: 'md:h-8 md:text-sm md:rounded-lg md:gap-0.5',
        lg: 'lg:h-8 lg:text-sm lg:rounded-lg lg:gap-0.5',
        xl: 'xl:h-8 xl:text-sm xl:rounded-lg xl:gap-0.5',
        '2xl': '2xl:h-8 2xl:text-sm 2xl:rounded-lg 2xl:gap-0.5',
    },
    md: {
        default: 'h-10 text-base rounded-xl gap-1',
        sm: 'sm:h-10 sm:text-base sm:rounded-xl sm:gap-1',
        md: 'md:h-10 md:text-base md:rounded-xl md:gap-1',
        lg: 'lg:h-10 lg:text-base lg:rounded-xl lg:gap-1',
        xl: 'xl:h-10 xl:text-base xl:rounded-xl xl:gap-1',
        '2xl': '2xl:h-10 2xl:text-base 2xl:rounded-xl 2xl:gap-1',
    },
    lg: {
        default: 'h-12 text-base rounded-xl gap-1',
        sm: 'sm:h-12 sm:text-base sm:rounded-xl sm:gap-1',
        md: 'md:h-12 md:text-base md:rounded-xl md:gap-1',
        lg: 'lg:h-12 lg:text-base lg:rounded-xl lg:gap-1',
        xl: 'xl:h-12 xl:text-base xl:rounded-xl xl:gap-1',
        '2xl': '2xl:h-12 2xl:text-base 2xl:rounded-xl 2xl:gap-1',
    },
};

const responsiveDefaultContextClassNames: ResponsiveAttributeClassMap<ButtonSize> = {
    sm: {
        default: 'min-w-20 px-2',
        sm: 'sm:min-w-20 sm:px-2',
        md: 'md:min-w-20 md:px-2',
        lg: 'lg:min-w-20 lg:px-2',
        xl: 'xl:min-w-20 xl:px-2',
        '2xl': '2xl:min-w-20 2xl:px-2',
    },
    md: {
        default: 'min-w-24 px-3',
        sm: 'sm:min-w-24 sm:px-3',
        md: 'md:min-w-24 md:px-3',
        lg: 'lg:min-w-24 lg:px-3',
        xl: 'xl:min-w-24 xl:px-3',
        '2xl': '2xl:min-w-24 2xl:px-3',
    },
    lg: {
        default: 'min-w-28 px-4',
        sm: 'sm:min-w-28 sm:px-4',
        md: 'md:min-w-28 md:px-4',
        lg: 'lg:min-w-28 lg:px-4',
        xl: 'xl:min-w-28 xl:px-4',
        '2xl': '2xl:min-w-28 2xl:px-4',
    },
};

const responsiveOnlyIconContextClassNames: ResponsiveAttributeClassMap<ButtonSize> = {
    sm: {
        default: 'w-8',
        sm: 'sm:w-8',
        md: 'md:w-8',
        lg: 'lg:w-8',
        xl: 'xl:w-8',
        '2xl': '2xl:w-8',
    },
    md: {
        default: 'w-10',
        sm: 'sm:w-10',
        md: 'md:w-10',
        lg: 'lg:w-10',
        xl: 'xl:w-10',
        '2xl': '2xl:w-10',
    },
    lg: {
        default: 'w-12',
        sm: 'sm:w-12',
        md: 'md:w-12',
        lg: 'lg:w-12',
        xl: 'xl:w-12',
        '2xl': '2xl:w-12',
    },
};

const sizeToIconSize: Record<ButtonSize, Record<ButtonContext, IconSize>> = {
    lg: {
        default: 'md',
        onlyIcon: 'lg',
    },
    md: {
        default: 'md',
        onlyIcon: 'md',
    },
    sm: {
        default: 'sm',
        onlyIcon: 'sm',
    },
};

const sizeToSpinnerSize: Record<ButtonSize, SpinnerSize> = {
    lg: 'md',
    md: 'md',
    sm: 'sm',
};

/**
 * Usage notes:
 *
 * - `isLoading` keeps the text label rendered and only replaces `iconLeft`/`iconRight` with a spinner — the label
 *   does not disappear.
 * - In the link form (`href` set), `disabled` is not forwarded as a native attribute: it sets `aria-disabled` and
 *   calls `preventDefault()` on click, so navigation is blocked while still rendering an `<a>` (the same guard
 *   applies while `isLoading`).
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, IButtonProps>((props, ref) => {
    const {
        variant = 'primary',
        size = 'lg',
        responsiveSize = {},
        iconRight,
        iconLeft,
        className,
        children,
        isLoading,
        disabled,
    } = props;

    const isOnlyIcon = children == null || children === '';
    const isDisabled = disabled === true || isLoading === true;
    const buttonContext = isOnlyIcon ? 'onlyIcon' : 'default';

    const commonClasses = [
        'flex flex-row items-center justify-center group', // Layout
        'leading-tight font-normal', // Typography
        'border transition-all cursor-pointer', // Commons
        'active:shadow-none aria-disabled:shadow-none aria-disabled:cursor-default', // Active/Disabled states
    ];

    const variantClasses = variantToClassNames[variant].filter((classes) => {
        // Do not apply specific state classes when button is on a disabled or loading state. Even though this
        // might be done through the tailwind enabled: modifier, it won't work when the button is a link.
        if (disabled) {
            return !classes.includes('hover');
        }
        if (isLoading) {
            return !classes.includes('disabled') && !classes.includes('hover') && !classes.includes('active');
        }

        return true;
    });

    const iconClassNames = classNames(
        'transition-all group-aria-disabled:icon-surface-disabled',
        variantToIconClassNames[variant],
    );

    const sizeClassNames = responsiveUtils.generateClassNames(size, responsiveSize, responsiveSizeClassNames);
    const contextClassNames = responsiveUtils.generateClassNames(
        size,
        responsiveSize,
        isOnlyIcon ? responsiveOnlyIconContextClassNames : responsiveDefaultContextClassNames,
    );

    const classes = classNames(commonClasses, variantClasses, sizeClassNames, contextClassNames, className, {
        'cursor-progress': isLoading,
    });

    const iconSize = sizeToIconSize[size][buttonContext];
    const iconResponsiveSize = Object.keys(responsiveSize).reduce<ResponsiveAttribute<IconSize>>(
        (current, breakpoint) => ({
            ...current,
            [breakpoint]: sizeToIconSize[responsiveSize[breakpoint as Breakpoint]!][buttonContext],
        }),
        {},
    );

    const spinnerSize = sizeToSpinnerSize[size];
    const spinnerResponsiveSize = Object.keys(responsiveSize).reduce<ResponsiveAttribute<SpinnerSize>>(
        (current, breakpoint) => ({
            ...current,
            [breakpoint]: sizeToSpinnerSize[responsiveSize[breakpoint as Breakpoint]!],
        }),
        {},
    );

    const displayIconLeft = !isLoading && iconLeft != null;
    const displayIconRight = !isLoading && iconRight != null && !isOnlyIcon;

    const commonProps = { className: classes, 'aria-disabled': isDisabled };
    const commonIconProps = { size: iconSize, responsiveSize: iconResponsiveSize, className: iconClassNames };

    const buttonContent = (
        <>
            {displayIconLeft && <Icon icon={iconLeft} {...commonIconProps} />}
            {isLoading && (
                <Spinner
                    responsiveSize={spinnerResponsiveSize}
                    size={spinnerSize}
                    variant={variantToSpinnerVariant[variant]}
                />
            )}
            {!isOnlyIcon && <div className="px-1">{children}</div>}
            {displayIconRight && <Icon icon={iconRight} {...commonIconProps} />}
        </>
    );

    const handleLinkClick =
        (onClick?: (event: MouseEvent<HTMLAnchorElement>) => void) => (event: MouseEvent<HTMLAnchorElement>) => {
            if (isDisabled) {
                event.preventDefault();
            } else {
                onClick?.(event);
            }
        };

    if ('href' in props && props.href !== undefined) {
        const {
            variant: _variant,
            size: _size,
            responsiveSize: _responsiveSize,
            iconRight: _iconRight,
            iconLeft: _iconLeft,
            className: _className,
            children: _children,
            isLoading: _isLoading,
            disabled: _disabled,
            href,
            onClick,
            ...linkProps
        } = props;

        return (
            <LinkBase
                href={href}
                onClick={handleLinkClick(onClick)}
                ref={ref as Ref<HTMLAnchorElement>}
                {...commonProps}
                {...linkProps}
            >
                {buttonContent}
            </LinkBase>
        );
    }

    const {
        variant: _variant,
        size: _size,
        responsiveSize: _responsiveSize,
        iconRight: _iconRight,
        iconLeft: _iconLeft,
        className: _className,
        children: _children,
        isLoading: _isLoading,
        disabled: _disabled,
        type = 'button',
        ...buttonProps
    } = props;

    return (
        <button disabled={isDisabled} ref={ref as Ref<HTMLButtonElement>} type={type} {...commonProps} {...buttonProps}>
            {buttonContent}
        </button>
    );
});

Button.displayName = 'Button';
