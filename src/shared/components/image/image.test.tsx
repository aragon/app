import { render, screen } from '@testing-library/react';
import { Image, type IImageProps } from './image';

describe('<Image /> component', () => {
    const createTestComponent = (props?: Partial<IImageProps>) => {
        const completeProps: IImageProps = { src: '/test', ...props };

        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image {...completeProps} />;
    };

    it('renders a NextJs image component', () => {
        render(createTestComponent());
        const image = screen.getByRole<HTMLImageElement>('img');
        expect(image).toBeInTheDocument();
        expect(image.src).toMatch(/_next\/image/);
    });
});
