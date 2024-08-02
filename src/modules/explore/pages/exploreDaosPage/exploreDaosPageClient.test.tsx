import { render, screen } from '@testing-library/react';
import { ExploreDaosPageClient, type IExploreDaosPageClientProps } from './exploreDaosPageClient';

jest.mock('../../components/daoList', () => ({
    DaoList: () => <div data-testid="dao-list-mock" />,
}));

describe('<ExploreDaosPageClient /> component', () => {
    const createTestComponent = (props?: Partial<IExploreDaosPageClientProps>) => {
        const completeProps: IExploreDaosPageClientProps = {
            initialParams: { queryParams: {} },
            ...props,
        };

        return <ExploreDaosPageClient {...completeProps} />;
    };

    it('renders the list of DAOs', () => {
        render(createTestComponent());
        expect(screen.getByTestId('dao-list-mock')).toBeInTheDocument();
    });
});
