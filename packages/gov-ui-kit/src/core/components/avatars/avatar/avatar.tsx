import * as RadixAvatar from '@radix-ui/react-avatar';
import classNames from 'classnames';
import type React from 'react';
import { type ComponentPropsWithoutRef, type ReactNode, useState } from 'react';
import type { ResponsiveAttribute, ResponsiveAttributeClassMap } from '../../../types';
import { responsiveUtils } from '../../../utils';
import { AvatarBase } from '../avatarBase';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IAvatarProps extends ComponentPropsWithoutRef<'img'> {
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
        default: 'size-4 text-[8px]',
        sm: 'sm:size-4 sm:text-[8px]',
        md: 'md:size-4 md:text-[8px]',
        lg: 'lg:size-4 lg:text-[8px]',
        xl: 'xl:size-4 xl:text-[8px]',
        '2xl': '2xl:size-4 2xl:text-[8px]',
    },
    sm: {
        default: 'size-6 text-xs',
        sm: 'sm:size-6 sm:text-xs',
        md: 'md:size-6 md:text-xs',
        lg: 'lg:size-6 lg:text-xs',
        xl: 'xl:size-6 xl:text-xs',
        '2xl': '2xl:size-6 2xl:text-xs',
    },
    md: {
        default: 'size-8 text-sm',
        sm: 'sm:size-8 sm:text-sm',
        md: 'md:size-8 md:text-sm',
        lg: 'lg:size-8 lg:text-sm',
        xl: 'xl:size-8 xl:text-sm',
        '2xl': '2xl:size-8 2xl:text-sm',
    },
    lg: {
        default: 'size-10 text-base',
        sm: 'sm:size-10 sm:text-base',
        md: 'md:size-10 md:text-base',
        lg: 'lg:size-10 lg:text-base',
        xl: 'xl:size-10 xl:text-base',
        '2xl': '2xl:size-10 2xl:text-base',
    },
    xl: {
        default: 'size-14 text-lg',
        sm: 'sm:size-14 sm:text-lg',
        md: 'md:size-14 md:text-lg',
        lg: 'lg:size-14 lg:text-lg',
        xl: 'xl:size-14 xl:text-lg',
        '2xl': '2xl:size-14 2xl:text-lg',
    },
    '2xl': {
        default: 'size-16 text-xl',
        sm: 'sm:size-16 sm:text-xl',
        md: 'md:size-16 md:text-xl',
        lg: 'lg:size-16 lg:text-xl',
        xl: 'xl:size-16 xl:text-xl',
        '2xl': '2xl:size-16 2xl:text-xl',
    },
};

export const Avatar: React.FC<IAvatarProps> = (props) => {
    const { alt = 'avatar', className, fallback, responsiveSize, size = 'sm', ...imageProps } = props;

    const [imgLoading, setImgLoading] = useState(false);

    const containerClassNames = classNames(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full leading-none [position:var(--guk-avatar-container-position)]',
        responsiveUtils.generateClassNames(size, responsiveSize, responsiveSizeClasses),
        className,
    );

    const handleOnLoadingStatusChange = (status: string) => setImgLoading(status === 'loading');

    const showFallback = fallback != null && !imgLoading;

    return (
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
};
