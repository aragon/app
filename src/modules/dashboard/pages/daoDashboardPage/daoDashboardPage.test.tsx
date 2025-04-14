import type * as ReactQuery from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DaoDashboardPage, type IDaoDashboardPageProps } from './daoDashboardPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode }) => props.children,
}));

jest.mock('./daoDashboardPageClient', () => ({
    DaoDashboardPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoDashboardPage /> component', () => {
    const createTestComponent = async (props?: Partial<IDaoDashboardPageProps>) => {
        const completeProps: IDaoDashboardPageProps = {
            params: Promise.resolve({ id: 'dao-id', pluginAddress: '0x123' }),
            ...props,
        };

        const Component = await DaoDashboardPage(completeProps);

        return Component;
    };

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
