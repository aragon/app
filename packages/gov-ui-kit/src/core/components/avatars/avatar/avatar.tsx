import * as RadixAvatar from '@radix-ui/react-avatar';
import classNames from 'classnames';
import type React from 'react';
import { Children, type ComponentPropsWithoutRef, type ReactNode, useState } from 'react';
import type { ResponsiveAttribute, ResponsiveAttributeClassMap } from '../../../types';
import { responsiveUtils } from '../../../utils';
import { AvatarBase } from '../avatarBase';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IAvatarProps extends ComponentPropsWithoutRef<'img'> {
    /**
     * Small round badge at the bottom-right of the avatar, e.g. a network logo, sized from the avatar size.
     * A badge wraps the avatar in a container, so put layout classes on a parent rather than in `className`.
     */
    badge?: ReactNode;
    /**
     *  Fallback content to display when the image fails to load or no image is provided.
     */
    fallback?: ReactNode;
    /**
     *  Responsive size attribute for the avatar.
     */
    responsiveSize?: ResponsiveAttribute<AvatarSize>;
    /**
     * The size of the avatar.
     * @default sm
     */
    size?: AvatarSize;
}

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

const responsiveBadgeClasses: ResponsiveAttributeClassMap<AvatarSize> = {
    xs: {
        default: 'size-2 -right-0.5 -bottom-0.5 ring-1',
        sm: 'sm:size-2 sm:-right-0.5 sm:-bottom-0.5 sm:ring-1',
        md: 'md:size-2 md:-right-0.5 md:-bottom-0.5 md:ring-1',
        lg: 'lg:size-2 lg:-right-0.5 lg:-bottom-0.5 lg:ring-1',
        xl: 'xl:size-2 xl:-right-0.5 xl:-bottom-0.5 xl:ring-1',
        '2xl': '2xl:size-2 2xl:-right-0.5 2xl:-bottom-0.5 2xl:ring-1',
    },
    sm: {
        default: 'size-3 -right-0.75 -bottom-0.75 ring-1',
        sm: 'sm:size-3 sm:-right-0.75 sm:-bottom-0.75 sm:ring-1',
        md: 'md:size-3 md:-right-0.75 md:-bottom-0.75 md:ring-1',
        lg: 'lg:size-3 lg:-right-0.75 lg:-bottom-0.75 lg:ring-1',
        xl: 'xl:size-3 xl:-right-0.75 xl:-bottom-0.75 xl:ring-1',
        '2xl': '2xl:size-3 2xl:-right-0.75 2xl:-bottom-0.75 2xl:ring-1',
    },
    md: {
        default: 'size-4 -right-1 -bottom-1 ring-2',
        sm: 'sm:size-4 sm:-right-1 sm:-bottom-1 sm:ring-2',
        md: 'md:size-4 md:-right-1 md:-bottom-1 md:ring-2',
        lg: 'lg:size-4 lg:-right-1 lg:-bottom-1 lg:ring-2',
        xl: 'xl:size-4 xl:-right-1 xl:-bottom-1 xl:ring-2',
        '2xl': '2xl:size-4 2xl:-right-1 2xl:-bottom-1 2xl:ring-2',
    },
    lg: {
        default: 'size-5 -right-1 -bottom-1 ring-2',
        sm: 'sm:size-5 sm:-right-1 sm:-bottom-1 sm:ring-2',
        md: 'md:size-5 md:-right-1 md:-bottom-1 md:ring-2',
        lg: 'lg:size-5 lg:-right-1 lg:-bottom-1 lg:ring-2',
        xl: 'xl:size-5 xl:-right-1 xl:-bottom-1 xl:ring-2',
        '2xl': '2xl:size-5 2xl:-right-1 2xl:-bottom-1 2xl:ring-2',
    },
    xl: {
        default: 'size-6 -right-1 -bottom-1 ring-2',
        sm: 'sm:size-6 sm:-right-1 sm:-bottom-1 sm:ring-2',
        md: 'md:size-6 md:-right-1 md:-bottom-1 md:ring-2',
        lg: 'lg:size-6 lg:-right-1 lg:-bottom-1 lg:ring-2',
        xl: 'xl:size-6 xl:-right-1 xl:-bottom-1 xl:ring-2',
        '2xl': '2xl:size-6 2xl:-right-1 2xl:-bottom-1 2xl:ring-2',
    },
    '2xl': {
        default: 'size-7 -right-1 -bottom-1 ring-2',
        sm: 'sm:size-7 sm:-right-1 sm:-bottom-1 sm:ring-2',
        md: 'md:size-7 md:-right-1 md:-bottom-1 md:ring-2',
        lg: 'lg:size-7 lg:-right-1 lg:-bottom-1 lg:ring-2',
        xl: 'xl:size-7 xl:-right-1 xl:-bottom-1 xl:ring-2',
        '2xl': '2xl:size-7 2xl:-right-1 2xl:-bottom-1 2xl:ring-2',
    },
};

export const Avatar: React.FC<IAvatarProps> = (props) => {
    const { alt = 'avatar', badge, className, fallback, responsiveSize, size = 'sm', ...imageProps } = props;

    const [imgLoading, setImgLoading] = useState(false);

    const containerClassNames = classNames(
        '[position:var(--guk-avatar-container-position)] flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        responsiveUtils.generateClassNames(size, responsiveSize, responsiveSizeClasses),
        className,
    );

    const handleOnLoadingStatusChange = (status: string) => setImgLoading(status === 'loading');

    const showFallback = fallback != null && !imgLoading;

    const avatar = (
        <RadixAvatar.Root className={containerClassNames}>
            <RadixAvatar.Image
                alt={alt}
                asChild={true}
                className="size-full rounded-[inherit] object-cover"
                onLoadingStatusChange={handleOnLoadingStatusChange}
                {...imageProps}
            >
                <AvatarBase />
            </RadixAvatar.Image>
            <RadixAvatar.Fallback
                className={classNames(
                    'size-full rounded-[inherit]',
                    { 'animate-pulse bg-neutral-200': imgLoading },
                    { 'bg-neutral-200': !fallback },
                    { 'flex items-center justify-center': showFallback },
                )}
                data-testid="fallback"
            >
                {showFallback && fallback}
            </RadixAvatar.Fallback>
        </RadixAvatar.Root>
    );

    if (Children.toArray(badge).length === 0) {
        return avatar;
    }

    const badgeClassNames = classNames(
        'absolute flex items-center justify-center overflow-hidden rounded-full bg-neutral-0 ring-neutral-0 *:size-full',
        responsiveUtils.generateClassNames(size, responsiveSize, responsiveBadgeClasses),
    );

    // The badge sits beside the avatar root, as the root's overflow-hidden would clip it.
    return (
        <span className="relative flex size-fit shrink-0">
            {avatar}
            <span className={badgeClassNames}>{badge}</span>
        </span>
    );
};
