import { render, screen } from '@testing-library/react';
import { Image, type IImageProps } from './image';

describe('<Image /> component', () => {
    const createTestComponent = (props?: Partial<IImageProps>) => {
        const completeProps: IImageProps = { ...props };

        return <Image {...completeProps} />;
    };

    it('renders a NextJs image component', () => {
        const src = '/test.jpg';
        render(createTestComponent({ src }));
        const image = screen.getByRole<HTMLImageElement>('img');
        expect(image).toBeInTheDocument();
        expect(image.src).toMatch(/_next\/image/);
    });

    it('renders empty container when src is not defined', () => {
        const src = undefined;
        const { container } = render(createTestComponent({ src }));
        expect(container).toBeEmptyDOMElement();
    });
});
