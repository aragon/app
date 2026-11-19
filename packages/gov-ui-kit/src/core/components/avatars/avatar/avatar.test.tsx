import { render, screen } from '@testing-library/react';
import { RadixImageMock } from '../../../test';
import { Avatar, type AvatarSize, type IAvatarProps } from './avatar';

describe('<Avatar /> component', () => {
    const originalGlobalImage = global.Image;

    const createTestComponent = (props?: Partial<IAvatarProps>) => {
        const completeProps: IAvatarProps = { ...props };

        return <Avatar {...completeProps} />;
    };

    beforeEach(() => {
        (window.Image as unknown) = RadixImageMock;
    });

    afterEach(() => {
        global.Image = originalGlobalImage;
    });

    it('renders fallback when no image provided', () => {
        const fallbackContent = 'fallback content';
        render(createTestComponent({ fallback: fallbackContent }));

        const fallback = screen.getByText(fallbackContent);

        expect(fallback).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it.each([
        ['xs', 'text-[8px]'],
        ['sm', 'text-xs'],
        ['md', 'text-sm'],
        ['lg', 'text-base'],
        ['xl', 'text-lg'],
        ['2xl', 'text-xl'],
    ] satisfies [AvatarSize, string][])('sizes %s fallback text with %s', (size, textClass) => {
        render(
            createTestComponent({
                fallback: <span data-testid="custom-fallback">AB</span>,
                size,
            }),
        );

        expect(screen.getByTestId('custom-fallback').parentElement?.parentElement).toHaveClass(textClass);
    });

    it('does not render fallback when valid image provided', () => {
        const fallbackContent = 'fallback content';
        render(createTestComponent({ fallback: fallbackContent, src: 'img.jpg' }));

        expect(screen.queryByText(fallbackContent)).not.toBeInTheDocument();
    });

    it('renders loading animation while image is loading', () => {
        render(createTestComponent({ src: 'img.jpg' }));

        const fallback = screen.getByTestId('fallback');
        expect(fallback).toHaveClass('animate-pulse');
    });

    it('renders the image with provided alt text after it has loaded', async () => {
        const altText = 'test';
        render(createTestComponent({ alt: altText, src: 'img.jpg' }));
        const image = await screen.findByRole('img');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('alt', altText);
    });

    it('renders the image with a default alt text', async () => {
        render(createTestComponent({ src: 'img.jpg' }));

        const image = await screen.findByRole('img');
        expect(image).toHaveAttribute('alt');
    });

    it.each([undefined, null, false, true, [], [null]])('renders no badge wrapper when the badge is %p', (badge) => {
        const { container } = render(createTestComponent({ badge }));
        expect(container.firstElementChild).toHaveClass('rounded-full');
    });

    it('renders the badge next to the avatar in a wrapper sized to the avatar', () => {
        const { container } = render(createTestComponent({ badge: <span data-testid="badge" /> }));
        const wrapper = container.firstElementChild;
        expect(wrapper).toHaveClass('relative', 'flex', 'size-fit');
        expect(wrapper?.firstElementChild).toHaveClass('rounded-full');
        expect(screen.getByTestId('badge')).toBeInTheDocument();
    });

    it.each([
        { size: 'xs', classes: ['size-2', 'ring-1'] },
        { size: 'sm', classes: ['size-3', 'ring-1'] },
        { size: 'md', classes: ['size-4', 'ring-2'] },
        { size: '2xl', classes: ['size-7', 'ring-2'] },
    ] as const)('sizes the badge from the $size avatar size', ({ size, classes }) => {
        render(createTestComponent({ size, badge: <span data-testid="badge" /> }));
        expect(screen.getByTestId('badge').parentElement).toHaveClass(...classes);
    });

    it('sizes the badge from the default sm size', () => {
        render(createTestComponent({ badge: <span data-testid="badge" /> }));
        expect(screen.getByTestId('badge').parentElement).toHaveClass('size-3');
    });

    it('sizes the badge responsively with the avatar', () => {
        render(createTestComponent({ size: 'sm', responsiveSize: { md: 'lg' }, badge: <span data-testid="badge" /> }));
        expect(screen.getByTestId('badge').parentElement).toHaveClass('size-3', 'md:size-5');
    });

    it('keeps the class name on the avatar root', () => {
        const { container } = render(
            createTestComponent({ className: 'test-class', badge: <span data-testid="badge" /> }),
        );
        expect(container.firstElementChild).not.toHaveClass('test-class');
        expect(container.firstElementChild?.firstElementChild).toHaveClass('test-class');
    });
});
