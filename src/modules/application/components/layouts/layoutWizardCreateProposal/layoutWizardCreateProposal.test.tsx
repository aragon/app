import { daoOptions } from '@/shared/api/daoService';
import { testLogger } from '@/test/utils';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { type ILayoutWizardCreateProposalProps, LayoutWizardCreateProposal } from './layoutWizardCreateProposal';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('../../navigations/navigationWizard', () => ({
    NavigationWizard: () => <div data-testid="navigation-wizard-mock" />,
}));

describe('<LayoutWizard /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const consoleErrorSpy = jest.spyOn(console, 'error');

    beforeEach(() => {
        consoleErrorSpy.mockImplementation(jest.fn());
        fetchQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        consoleErrorSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<ILayoutWizardCreateProposalProps>) => {
        const completeProps: ILayoutWizardCreateProposalProps = {
            params: { id: 'test-wizard' },
            ...props,
        };

        return <LayoutWizardCreateProposal {...completeProps} />;
    };

    it('renders the navigation wizard component and children property', async () => {
        const children = 'test-children';
        render(await createTestComponent({ children }));
        expect(screen.getByTestId('navigation-wizard-mock')).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('prefetches the DAO data from the url param when provided', async () => {
        const params = { id: 'my-wizard' };
        render(await createTestComponent({ params }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(daoOptions({ urlParams: { id: params.id } }).queryKey);
    });

    it('dehydrates the query client state', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('hydration-mock')).toBeInTheDocument();
    });

    it('displays an error feedback but renders the navigation wizard if an error is thrown by a child component', async () => {
        testLogger.suppressErrors();
        const Children = () => {
            throw new Error('Test error');
        };

        render(await createTestComponent({ children: <Children /> }));
        expect(screen.getByTestId('navigation-wizard-mock')).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
    });

    it('renders error with a link to the explore page on fetch DAO error', async () => {
        const daoId = 'wizard-id';
        fetchQuerySpy.mockRejectedValue('error');
        render(await createTestComponent({ params: { id: daoId } }));
        const errorLink = screen.getByRole('link', { name: /app.shared.wizard.notFound.action/ });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(`/`);
    });
});
