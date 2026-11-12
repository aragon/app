import classNames from 'classnames';
import type React from 'react';
import { type ComponentPropsWithoutRef, cloneElement, type ReactElement } from 'react';
import type { ResponsiveAttribute, ResponsiveAttributeClassMap } from '../../../types';
import { responsiveUtils } from '../../../utils';
import { Avatar, type AvatarSize, type IAvatarProps } from '../avatar';

export interface IAvatarStackProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
    /**
     * Avatar nodes rendered in order. The first two are shown; any remaining avatars are collapsed into
     * a trailing count avatar capped visually at `9+`.
     */
    avatars: readonly ReactElement<IAvatarProps>[];
    /**
     * Responsive avatar size override for the stack.
     */
    responsiveSize?: ResponsiveAttribute<AvatarSize>;
    /**
     * Avatar size override. Without one, the stack uses `md` for one avatar, `sm` for two, and `xs`
     * for three or more.
     */
    size?: AvatarSize;
}

// Mirrors Avatar slot dimensions so stacked icons line up with standalone avatars. Literal classes
// are required for Tailwind's content scanner.
const responsiveSizeClasses: ResponsiveAttributeClassMap<AvatarSize> = {
    xs: {
        default: 'size-4',
        sm: 'sm:size-4',
        md: 'md:size-4',
        lg: 'lg:size-4',
        xl: 'xl:size-4',
        '2xl': '2xl:size-4',
    },
    sm: {
        default: 'size-6',
        sm: 'sm:size-6',
        md: 'md:size-6',
        lg: 'lg:size-6',
        xl: 'xl:size-6',
        '2xl': '2xl:size-6',
    },
    md: {
        default: 'size-8',
        sm: 'sm:size-8',
        md: 'md:size-8',
        lg: 'lg:size-8',
        xl: 'xl:size-8',
        '2xl': '2xl:size-8',
    },
    lg: {
        default: 'size-10',
        sm: 'sm:size-10',
        md: 'md:size-10',
        lg: 'lg:size-10',
        xl: 'xl:size-10',
        '2xl': '2xl:size-10',
    },
    xl: {
        default: 'size-14',
        sm: 'sm:size-14',
        md: 'md:size-14',
        lg: 'lg:size-14',
        xl: 'xl:size-14',
        '2xl': '2xl:size-14',
    },
    '2xl': {
        default: 'size-16',
        sm: 'sm:size-16',
        md: 'md:size-16',
        lg: 'lg:size-16',
        xl: 'xl:size-16',
        '2xl': '2xl:size-16',
    },
};

const responsiveOverlapClasses: ResponsiveAttributeClassMap<AvatarSize> = {
    xs: {
        default: '-ml-1',
        sm: 'sm:-ml-1',
        md: 'md:-ml-1',
        lg: 'lg:-ml-1',
        xl: 'xl:-ml-1',
        '2xl': '2xl:-ml-1',
    },
    sm: {
        default: '-ml-1.5',
        sm: 'sm:-ml-1.5',
        md: 'md:-ml-1.5',
        lg: 'lg:-ml-1.5',
        xl: 'xl:-ml-1.5',
        '2xl': '2xl:-ml-1.5',
    },
    md: {
        default: '-ml-2',
        sm: 'sm:-ml-2',
        md: 'md:-ml-2',
        lg: 'lg:-ml-2',
        xl: 'xl:-ml-2',
        '2xl': '2xl:-ml-2',
    },
    lg: {
        default: '-ml-2.5',
        sm: 'sm:-ml-2.5',
        md: 'md:-ml-2.5',
        lg: 'lg:-ml-2.5',
        xl: 'xl:-ml-2.5',
        '2xl': '2xl:-ml-2.5',
    },
    xl: {
        default: '-ml-3',
        sm: 'sm:-ml-3',
        md: 'md:-ml-3',
        lg: 'lg:-ml-3',
        xl: 'xl:-ml-3',
        '2xl': '2xl:-ml-3',
    },
    '2xl': {
        default: '-ml-4',
        sm: 'sm:-ml-4',
        md: 'md:-ml-4',
        lg: 'lg:-ml-4',
        xl: 'xl:-ml-4',
        '2xl': '2xl:-ml-4',
    },
};

/**
 * Overlapping row of avatars with an automatic overflow count avatar.
 *
 * Usage notes:
 *
 * - Pass fully rendered `Avatar`-compatible nodes through `avatars`; the stack applies one shared
 *   size to them.
 * - The default size steps down from `md` for one avatar to `sm` for two and `xs` for three or more.
 * - Three or more avatars render the first two plus a neutral count avatar capped visually at `9+`.
 * - Accessibility is caller-controlled: set `aria-label`/`role` on the stack as needed.
 */
export const AvatarStack: React.FC<IAvatarStackProps> = (props) => {
    const { avatars, size, responsiveSize, className, ...otherProps } = props;

    const stackSize = size ?? (avatars.length <= 1 ? 'md' : avatars.length === 2 ? 'sm' : 'xs');
    const slotSizeClassName = responsiveUtils.generateClassNames(stackSize, responsiveSize, responsiveSizeClasses);
    const overlapClassName = responsiveUtils.generateClassNames(stackSize, responsiveSize, responsiveOverlapClasses);
    const slotBaseClassName = 'relative flex shrink-0 overflow-hidden rounded-full [&>*]:size-full!';

    const visibleAvatars = avatars.slice(0, 2);
    const overflowCount = avatars.length - 2;

    return (
        <span className={classNames('inline-flex items-center', className)} {...otherProps}>
            {visibleAvatars.map((avatar, index) => (
                <span
                    className={classNames(slotBaseClassName, slotSizeClassName, index > 0 && overlapClassName)}
                    // biome-ignore lint/suspicious/noArrayIndexKey: slots are positional and stateless
                    key={index}
                >
                    {cloneElement(avatar, { responsiveSize, size: stackSize })}
                </span>
            ))}
            {overflowCount > 0 && (
                <Avatar
                    className={overlapClassName}
                    fallback={
                        <span
                            aria-label={`+${overflowCount}`}
                            className="flex size-full items-center justify-center bg-neutral-50 font-semibold text-neutral-500"
                            role="img"
                        >
                            {overflowCount > 9 ? '9+' : `+${overflowCount}`}
                        </span>
                    }
                    responsiveSize={responsiveSize}
                    size={stackSize}
                />
            )}
        </span>
    );
};
