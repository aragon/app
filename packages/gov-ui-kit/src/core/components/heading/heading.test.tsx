import { render, screen } from '@testing-library/react';
import { Heading, type IHeadingProps } from './heading';

describe('<Heading /> component', () => {
    const createTestComponent = (props?: Partial<IHeadingProps>) => {
        const completeProps = { ...props };

        return <Heading {...completeProps} />;
    };

    it('renders without crashing', () => {
        const children = 'Test Heading';
        render(createTestComponent({ children }));

        expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });

    it('renders the correct element type when `as` prop is provided', () => {
        const size = 'h2';
        const as = 'h4';
        const children = '<h2 /> as <h4 />';
        render(createTestComponent({ size, as, children }));

        expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });

    it('keeps choosing the element from `as` and `size` when a typography role is set', () => {
        render(createTestComponent({ as: 'h3', typeRole: 'title-item', children: 'Item title' }));
        expect(screen.getByRole('heading', { level: 3, name: 'Item title' })).toBeInTheDocument();
    });

    it('renders an h1 by default when only a typography role is set', () => {
        render(createTestComponent({ typeRole: 'supporting', children: 'Supporting heading' }));
        expect(screen.getByRole('heading', { level: 1, name: 'Supporting heading' })).toBeInTheDocument();
    });
});
