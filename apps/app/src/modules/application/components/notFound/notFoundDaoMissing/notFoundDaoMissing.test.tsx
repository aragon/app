import { render, screen } from '@testing-library/react';
import {
    type INotFoundDaoMissingProps,
    NotFoundDaoMissing,
} from './notFoundDaoMissing';

describe('<NotFoundDaoMissing /> component', () => {
    const createTestComponent = (props?: Partial<INotFoundDaoMissingProps>) => {
        const completeProps: INotFoundDaoMissingProps = { ...props };

        return <NotFoundDaoMissing {...completeProps} />;
    };

    it('renders the DAO not found feedback linking to the explore page', () => {
        render(createTestComponent());
        expect(
            screen.getByText(/notFoundDaoMissing.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/notFoundDaoMissing.description/),
        ).toBeInTheDocument();
        expect(screen.getByTestId('MAGNIFYING_GLASS')).toBeInTheDocument();

        const link = screen.getByRole('link', {
            name: /notFoundDaoMissing.action/,
        });
        expect(link).toBeInTheDocument();
        expect(link.getAttribute('href')).toEqual('/');
    });
});
