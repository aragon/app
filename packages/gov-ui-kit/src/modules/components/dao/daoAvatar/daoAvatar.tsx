import type React from 'react';
import { Avatar, type AvatarSize, type IAvatarProps } from '../../../../core';

export interface IDaoAvatarProps extends Omit<IAvatarProps, 'fallback'> {
    /**
     * Name of the DAO
     */
    name?: string;
    /**
     * The size of the avatar.
     * @default lg
     */
    size?: AvatarSize;
}

/**
 * Usage notes:
 *
 * - Without a usable `src`, the avatar shows a primary-colored initials fallback instead of an empty image.
 * - The fallback initials are uppercase: a short name is kept whole, a longer single word uses its first two
 *   characters, and a multi-word name uses the first character of its first two words.
 */
export const DaoAvatar: React.FC<IDaoAvatarProps> = (props) => {
    const { name, size = 'lg', responsiveSize, ...otherProps } = props;
    const daoInitials = getDaoInitials(name).toUpperCase();

    return (
        <Avatar
            fallback={
                <span className="flex size-full items-center justify-center rounded-full bg-primary-400 text-neutral-0">
                    {daoInitials}
                </span>
            }
            responsiveSize={responsiveSize}
            size={size}
            {...otherProps}
        />
    );
};

/**
 * Get the initials for a DAO
 * @param name name of the DAO
 * @returns the DAO initials
 */
function getDaoInitials(name: IDaoAvatarProps['name']): string {
    if (!name) {
        return '';
    }

    const trimmedName = name.trim();

    if (trimmedName.length <= 2) {
        return trimmedName;
    }

    const words = trimmedName.split(' ');
    if (words.length < 2) {
        return words[0][0] + words[0][1];
    }
    return words[0][0] + words[1][0];
}
