import { Tooltip } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { forwardRef } from 'react';

export interface ITooltipIconButtonProps
    extends React.ComponentPropsWithoutRef<'button'> {
    /**
     * Tooltip text, doubling as the accessible name of the button.
     */
    tooltip: string;
    /**
     * Side of the tooltip.
     * @default bottom
     */
    side?: 'top' | 'bottom' | 'left' | 'right';
    /**
     * Visual style of the button. `unstyled` carries no colors so the caller owns the whole
     * appearance through className.
     * @default ghost
     */
    variant?: 'ghost' | 'outline' | 'primary' | 'unstyled';
    /**
     * Size of the button. `none` carries no size class so the caller owns it through className.
     * @default md
     */
    size?: 'md' | 'lg' | 'none';
    /**
     * Renders the control as a link to this URL instead of a button.
     */
    href?: string;
}

// The classes never overlap between the base, a variant and a size, so call sites don't depend on
// CSS order to win (the widget styles with classnames, not tailwind-merge). Bespoke buttons use
// variant `unstyled` (and size `none`) instead of overriding variant classes.
const variantClasses: Record<
    NonNullable<ITooltipIconButtonProps['variant']>,
    string
> = {
    ghost: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800',
    outline:
        'border border-neutral-100 bg-neutral-0 text-neutral-500 shadow-sm hover:bg-neutral-50 hover:text-neutral-800',
    primary: 'bg-primary-400 text-neutral-0 hover:bg-primary-500',
    unstyled: '',
};

const sizeClasses: Record<
    NonNullable<ITooltipIconButtonProps['size']>,
    string
> = {
    md: 'size-7',
    lg: 'size-9',
    none: '',
};

// Port of the assistant-ui registry tooltip-icon-button: a small round icon button with a tooltip
// label. The shadcn button/tooltip pair is replaced by a styled native button and the gov-ui-kit
// Tooltip; primitives compose onto it through `asChild`, so it forwards ref and props. The
// registry passes shadcn button variants through — mirrored here as the variant/size props.
export const TooltipIconButton = forwardRef<
    HTMLButtonElement,
    ITooltipIconButtonProps
>((props, ref) => {
    const {
        children,
        tooltip,
        className,
        type = 'button',
        variant = 'ghost',
        size = 'md',
        href,
        ...rest
    } = props;

    const classes = classNames(
        'focus-ring-primary inline-flex shrink-0 items-center justify-center rounded-full outline-none transition-colors active:scale-90 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
    );

    const content = (
        <>
            {children}
            <span className="sr-only">{tooltip}</span>
        </>
    );

    return (
        <Tooltip content={tooltip} triggerAsChild={true}>
            {href != null ? (
                <a
                    className={classes}
                    href={href}
                    ref={ref as React.Ref<HTMLAnchorElement>}
                    {...(rest as React.ComponentPropsWithoutRef<'a'>)}
                >
                    {content}
                </a>
            ) : (
                <button className={classes} ref={ref} type={type} {...rest}>
                    {content}
                </button>
            )}
        </Tooltip>
    );
});

TooltipIconButton.displayName = 'TooltipIconButton';
