import { render, screen } from '@testing-library/react';
import { Container, type IContainerProps } from './container';

describe('<Container /> component', () => {
    const createTestComponent = (props?: Partial<IContainerProps>) => {
        const completeProps: IContainerProps = { ...props };

        return <Container {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
