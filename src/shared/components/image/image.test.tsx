import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { Image, type IImageProps } from './image';

describe('<Image /> component', () => {
    const createTestComponent = (props?: Partial<IImageProps>) => {
        const completeProps: IImageProps = { ...props };

        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image {...completeProps} />;
    };

    it('renders a NextJs image component', () => {
        testLogger.suppressErrors();
        const src = '/test.jpg';
        render(createTestComponent({ src }));
        const image = screen.getByRole<HTMLImageElement>('img');
        expect(image).toBeInTheDocument();
        expect(image.src).toMatch(/_next\/image/);
    });

    it('sets default src when relative property is not defined', () => {
        testLogger.suppressErrors();
        expect(() => render(createTestComponent())).not.toThrow();
    });
});
