import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar, type AvatarSize } from '../avatar';
import { AvatarStack } from './avatarStack';

const avatars = [
    <Avatar
        fallback={<span className="flex size-full items-center justify-center bg-primary-200 text-primary-800">A</span>}
        key="alpha"
    />,
    <Avatar
        fallback={<span className="flex size-full items-center justify-center bg-info-100 text-info-800">B</span>}
        key="beta"
    />,
    <Avatar
        fallback={<span className="flex size-full items-center justify-center bg-success-100 text-success-800">C</span>}
        key="charlie"
    />,
    <Avatar
        fallback={<span className="flex size-full items-center justify-center bg-warning-100 text-warning-800">D</span>}
        key="delta"
    />,
];

const manyAvatars = Array.from({ length: 26 }, (_, index) => (
    <Avatar
        fallback={
            <span className="flex size-full items-center justify-center bg-primary-200 text-primary-800">
                {index + 1}
            </span>
        }
        key={index}
    />
));

const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

const meta: Meta<typeof AvatarStack> = {
    title: 'Core/Avatars/AvatarStack',
    component: AvatarStack,
    argTypes: {
        size: {
            control: { type: 'select' },
            options: sizes,
        },
        responsiveSize: {
            control: { type: 'object' },
        },
    },
};

type Story = StoryObj<typeof AvatarStack>;

/**
 * AvatarStack with no avatars.
 */
export const Empty: Story = {
    args: {
        avatars: [],
    },
};

/**
 * AvatarStack with one avatar.
 */
export const Single: Story = {
    args: {
        avatars: [avatars[0]],
    },
};

/**
 * AvatarStack with two avatars.
 */
export const Two: Story = {
    args: {
        avatars: avatars.slice(0, 2),
    },
};

/**
 * AvatarStack with an overflow count.
 */
export const Overflow: Story = {
    args: {
        avatars,
    },
};

/**
 * AvatarStack with a capped overflow count.
 */
export const LargeOverflow: Story = {
    args: {
        avatars: manyAvatars,
    },
};

/**
 * AvatarStack with responsive sizing.
 */
export const Responsive: Story = {
    args: {
        avatars,
        responsiveSize: {
            sm: 'sm',
            md: 'md',
            lg: 'lg',
        },
        size: 'xs',
    },
};

/**
 * AvatarStack examples for every supported avatar size.
 */
export const AllSizes: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            {sizes.map((size) => (
                <AvatarStack avatars={avatars} key={size} size={size} />
            ))}
        </div>
    ),
};

export default meta;
