import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CreateProposalPage, type ICreateProposalPageProps } from './createProposalPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode }) => props.children,
}));

jest.mock('./createProposalPageClient', () => ({
    CreateProposalPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<CreateProposalPage /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalPageProps>) => {
        const completeProps: ICreateProposalPageProps = { daoId: 'test', ...props };

        return <CreateProposalPage {...completeProps} />;
    };

    it('renders the client component', () => {
        render(createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
