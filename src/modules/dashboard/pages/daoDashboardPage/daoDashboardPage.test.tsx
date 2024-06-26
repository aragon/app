import { render, screen } from '@testing-library/react';
import { DaoDashboardPage, type IDaoDashboardPageProps } from './daoDashboardPage';

jest.mock('./daoDashboardPageClient', () => ({
    DaoDashboardPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoDashboardPage /> component', () => {
    const createTestComponent = (props?: Partial<IDaoDashboardPageProps>) => {
        const completeProps: IDaoDashboardPageProps = {
            params: { id: 'dao-id' },
            ...props,
        };

        return <DaoDashboardPage {...completeProps} />;
    };

    it('renders the page client component', async () => {
        render(createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
