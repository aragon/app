import classNames from 'classnames';
import { forwardRef, type MouseEvent, type Ref } from 'react';
import type { Breakpoint, ResponsiveAttribute, ResponsiveAttributeClassMap } from '../../types';
import { responsiveUtils } from '../../utils';
import { Icon, type IconSize } from '../icon';
import { LinkBase } from '../link';
import { Spinner } from '../spinner';
import type { SpinnerSize, SpinnerVariant } from '../spinner/spinner';
import type { ButtonContext, ButtonSize, ButtonVariant, IButtonProps } from './button.api';

// Using aria-disabled: instead of disabled: modifier in order to make the modifier work for buttons and links
const variantToClassNames: Record<ButtonVariant, string[]> = {
    primary: [
        'bg-primary-400 text-neutral-0 border-primary-400 shadow-primary-sm', // Default
        'hover:bg-primary-500 hover:border-primary-500 hover:shadow-primary', // Hover
        'active:bg-primary-800 active:border-primary-800 focus-ring-primary', // Active / Focus
        'aria-disabled:bg-neutral-100 aria-disabled:text-neutral-300 aria-disabled:border-neutral-100', // Disabled
    ],
    secondary: [
        'bg-neutral-0 text-primary-400 border-primary-100 shadow-primary-sm', // Default
        'hover:border-primary-200 hover:bg-primary-50 hover:shadow-primary', // Hover
        'active:border-primary-400 active:bg-neutral-0 focus-ring-primary', // Active / Focus
        'aria-disabled:bg-neutral-100 aria-disabled:text-neutral-300 aria-disabled:border-neutral-100', // Disabled
    ],
    tertiary: [
        'bg-neutral-0 text-neutral-500 border-neutral-100 shadow-neutral-sm', // Default
        'hover:bg-neutral-50 hover:border-neutral-200 hover:shadow-neutral', // Hover
        'active:bg-neutral-0 active:border-neutral-400 active:text-neutral-800 focus-ring-primary', // Active / Focus
        'aria-disabled:bg-neutral-100 aria-disabled:text-neutral-300 aria-disabled:border-neutral-100', // Disabled
    ],
    ghost: [
        'bg-transparent border-transparent text-primary-400', // Default
        'hover:bg-neutral-0', // Hover
        'active:bg-neutral-0 active:text-primary-600 focus-ring-primary', // Active / Focus
        'aria-disabled:text-neutral-300', // Disabled
    ],
    success: [
        'bg-success-100 text-success-800 border-success-300 shadow-success-sm', // Default
        'hover:border-success-500 hover:shadow-success', // Hover
        'active:bg-neutral-0 active:border-success-600 focus-ring-success', // Active / Focus
        'aria-disabled:bg-neutral-100 aria-disabled:text-neutral-300 aria-disabled:border-neutral-100', // Disabled
    ],
    warning: [
        'bg-warning-100 text-warning-800 border-warning-300 shadow-warning-sm', // Default
        'hover:border-warning-500 hover:shadow-warning', // Hover
        'active:bg-neutral-0 active:border-warning-600 focus-ring-warning', // Active / Focus
        'aria-disabled:bg-neutral-100 aria-disabled:text-neutral-300 aria-disabled:border-neutral-100', // Disabled
    ],
    critical: [
        'bg-critical-100 text-critical-800 border-critical-300 shadow-critical-sm', // Default
        'hover:border-critical-500 hover:shadow-critical', // Hover
        'active:bg-neutral-0 active:border-critical-600 focus-ring-critical', // Active / Focus
        'aria-disabled:bg-neutral-100 aria-disabled:text-neutral-300 aria-disabled:border-neutral-100', // Disabled
    ],
};

const variantToIconClassNames: Record<ButtonVariant, string> = {
    primary: 'text-neutral-0',
    secondary: 'text-primary-300 group-hover:text-primary-400 group-active:text-primary-400',
    tertiary: 'text-neutral-300 group-hover:text-neutral-500 group-active:text-neutral-500',
    ghost: 'text-primary-300 group-hover:text-primary-400 group-active:text-primary-400',
    success: 'text-success-500 group-hover:text-success-600 group-active:text-success-600',
    warning: 'text-warning-500 group-hover:text-warning-600 group-active:text-warning-600',
    critical: 'text-critical-500 group-hover:text-critical-600 group-active:text-critical-600',
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
        default: 'h-control-sm text-sm rounded-lg gap-control-sm',
        sm: 'sm:h-control-sm sm:text-sm sm:rounded-lg sm:gap-control-sm',
        md: 'md:h-control-sm md:text-sm md:rounded-lg md:gap-control-sm',
        lg: 'lg:h-control-sm lg:text-sm lg:rounded-lg lg:gap-control-sm',
        xl: 'xl:h-control-sm xl:text-sm xl:rounded-lg xl:gap-control-sm',
        '2xl': '2xl:h-control-sm 2xl:text-sm 2xl:rounded-lg 2xl:gap-control-sm',
    },
    md: {
        default: 'h-control-md text-base rounded-xl gap-control-md',
        sm: 'sm:h-control-md sm:text-base sm:rounded-xl sm:gap-control-md',
        md: 'md:h-control-md md:text-base md:rounded-xl md:gap-control-md',
        lg: 'lg:h-control-md lg:text-base lg:rounded-xl lg:gap-control-md',
        xl: 'xl:h-control-md xl:text-base xl:rounded-xl xl:gap-control-md',
        '2xl': '2xl:h-control-md 2xl:text-base 2xl:rounded-xl 2xl:gap-control-md',
    },
    lg: {
        default: 'h-control-lg text-base rounded-xl gap-control-lg',
        sm: 'sm:h-control-lg sm:text-base sm:rounded-xl sm:gap-control-lg',
        md: 'md:h-control-lg md:text-base md:rounded-xl md:gap-control-lg',
        lg: 'lg:h-control-lg lg:text-base lg:rounded-xl lg:gap-control-lg',
        xl: 'xl:h-control-lg xl:text-base xl:rounded-xl xl:gap-control-lg',
        '2xl': '2xl:h-control-lg 2xl:text-base 2xl:rounded-xl 2xl:gap-control-lg',
    },
};

const responsiveDefaultContextClassNames: ResponsiveAttributeClassMap<ButtonSize> = {
    sm: {
        default: 'min-w-20 px-control-sm',
        sm: 'sm:min-w-20 sm:px-control-sm',
        md: 'md:min-w-20 md:px-control-sm',
        lg: 'lg:min-w-20 lg:px-control-sm',
        xl: 'xl:min-w-20 xl:px-control-sm',
        '2xl': '2xl:min-w-20 2xl:px-control-sm',
    },
    md: {
        default: 'min-w-24 px-control-md',
        sm: 'sm:min-w-24 sm:px-control-md',
        md: 'md:min-w-24 md:px-control-md',
        lg: 'lg:min-w-24 lg:px-control-md',
        xl: 'xl:min-w-24 xl:px-control-md',
        '2xl': '2xl:min-w-24 2xl:px-control-md',
    },
    lg: {
        default: 'min-w-28 px-control-lg',
        sm: 'sm:min-w-28 sm:px-control-lg',
        md: 'md:min-w-28 md:px-control-lg',
        lg: 'lg:min-w-28 lg:px-control-lg',
        xl: 'xl:min-w-28 xl:px-control-lg',
        '2xl': '2xl:min-w-28 2xl:px-control-lg',
    },
};

const responsiveOnlyIconContextClassNames: ResponsiveAttributeClassMap<ButtonSize> = {
    sm: {
        default: 'w-control-sm',
        sm: 'sm:w-control-sm',
        md: 'md:w-control-sm',
        lg: 'lg:w-control-sm',
        xl: 'xl:w-control-sm',
        '2xl': '2xl:w-control-sm',
    },
    md: {
        default: 'w-control-md',
        sm: 'sm:w-control-md',
        md: 'md:w-control-md',
        lg: 'lg:w-control-md',
        xl: 'xl:w-control-md',
        '2xl': '2xl:w-control-md',
    },
    lg: {
        default: 'w-control-lg',
        sm: 'sm:w-control-lg',
        md: 'md:w-control-lg',
        lg: 'lg:w-control-lg',
        xl: 'xl:w-control-lg',
        '2xl': '2xl:w-control-lg',
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
        'transition-all group-aria-disabled:text-neutral-300',
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
            {!isOnlyIcon && <div className="px-control-label">{children}</div>}
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
