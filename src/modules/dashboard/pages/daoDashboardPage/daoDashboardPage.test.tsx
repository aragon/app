import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DaoDashboardPage, type IDaoDashboardPageProps } from './daoDashboardPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode }) => props.children,
}));

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
