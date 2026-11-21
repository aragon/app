import { render, screen } from '@testing-library/react';

import { Avatar } from '../avatar';
import { AvatarStack, type IAvatarStackProps } from './avatarStack';

const createAvatar = (name: string) => <Avatar fallback={<span data-testid={`avatar-${name}`}>{name}</span>} />;

describe('<AvatarStack /> component', () => {
    const createTestComponent = (props?: Partial<IAvatarStackProps>) => {
        const completeProps: IAvatarStackProps = {
            avatars: [createAvatar('first'), createAvatar('second')],
            ...props,
        };

        return <AvatarStack {...completeProps} />;
    };

    it('renders no visual slots for zero avatars', () => {
        render(createTestComponent({ avatars: [], title: 'Empty avatar stack' }));

        expect(screen.getByTitle('Empty avatar stack')).toBeEmptyDOMElement();
    });

    it('renders one avatar in one slot', () => {
        render(createTestComponent({ avatars: [createAvatar('first')] }));

        expect(screen.getByTestId('avatar-first')).toBeInTheDocument();
        expect(screen.queryByTestId('avatar-second')).not.toBeInTheDocument();
        expect(screen.getByTestId('avatar-first').parentElement?.parentElement?.parentElement).toHaveClass('size-8');
    });

    it('renders two avatars in input order', () => {
        render(createTestComponent({ avatars: [createAvatar('first'), createAvatar('second')] }));

        expect(screen.getAllByTestId(/avatar-/).map((avatar) => avatar.textContent)).toEqual(['first', 'second']);
        expect(screen.getByTestId('avatar-first').parentElement?.parentElement?.parentElement).toHaveClass('size-6');
    });
    it('retains duplicate avatar nodes', () => {
        const avatar = createAvatar('duplicate');
        render(createTestComponent({ avatars: [avatar, avatar] }));

        expect(screen.getAllByTestId('avatar-duplicate')).toHaveLength(2);
    });

    it('renders the first two avatars and the remaining count for three avatars', () => {
        render(
            createTestComponent({
                avatars: [createAvatar('first'), createAvatar('second'), createAvatar('third')],
            }),
        );

        const firstSlot = screen.getByTestId('avatar-first').parentElement?.parentElement?.parentElement;
        const overflowAvatar = screen.getByText('+1').parentElement?.parentElement;

        expect(screen.getAllByTestId(/avatar-/).map((avatar) => avatar.textContent)).toEqual(['first', 'second']);
        expect(screen.queryByTestId('avatar-third')).not.toBeInTheDocument();
        expect(screen.getByText('+1')).toHaveClass('bg-neutral-50');
        expect(firstSlot).toHaveClass('size-4');
        expect(firstSlot).not.toHaveClass('border-2');
        expect(overflowAvatar).toHaveClass('text-[8px]');
        expect(overflowAvatar).not.toHaveClass('border-2');
    });

    it('uses the overflow math for four avatars', () => {
        render(
            createTestComponent({
                avatars: [createAvatar('first'), createAvatar('second'), createAvatar('third'), createAvatar('fourth')],
            }),
        );

        expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('caps the visible overflow count at nine while preserving the exact accessible count', () => {
        render(
            createTestComponent({
                avatars: Array.from({ length: 26 }, (_, index) => createAvatar(String(index))),
            }),
        );

        expect(screen.getByLabelText('+24')).toHaveTextContent('9+');
        expect(screen.queryByText('+24')).not.toBeInTheDocument();
    });

    it('forwards native span attributes, className, and aria attributes', () => {
        render(
            createTestComponent({
                'aria-label': 'Avatar collection',
                className: 'custom-stack',
                title: 'Avatars',
            }),
        );

        const stack = screen.getByLabelText('Avatar collection');
        expect(stack.tagName).toBe('SPAN');
        expect(stack).toHaveClass('custom-stack');
        expect(stack).toHaveAttribute('title', 'Avatars');
    });

    it('applies responsive slot sizing', () => {
        render(
            createTestComponent({
                avatars: [createAvatar('first')],
                responsiveSize: { md: 'xs' },
                size: 'lg',
            }),
        );

        const slot = screen.getByTestId('avatar-first').parentElement?.parentElement?.parentElement;
        expect(slot).toHaveClass('size-10', 'md:size-4');
    });
});
