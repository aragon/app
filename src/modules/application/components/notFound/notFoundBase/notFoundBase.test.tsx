import { render, screen } from '@testing-library/react';
import { type INotFoundBaseProps, NotFoundBase } from './notFoundBase';

describe('<NotFoundBase /> component', () => {
    const createTestComponent = (props?: Partial<INotFoundBaseProps>) => {
        const completeProps: INotFoundBaseProps = { ...props };

        return <NotFoundBase {...completeProps} />;
    };

    it('renders a generic page not found feedback', () => {
        render(createTestComponent());
        expect(screen.getByText(/notFoundBase.title/)).toBeInTheDocument();
        expect(screen.getByText(/notFoundBase.description/)).toBeInTheDocument();
        expect(screen.getByTestId('MAGNIFYING_GLASS')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: /notFoundBase.action/ });
        expect(link).toBeInTheDocument();
        expect(link.getAttribute('href')).toEqual('/');
    });
});
