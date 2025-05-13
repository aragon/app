import { daoOptions, Network } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { testLogger } from '@/test/utils';
import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LayoutWizard, type ILayoutWizardProps } from './layoutWizard';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
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
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        resolveDaoIdSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<ILayoutWizardProps>) => {
        const completeProps: ILayoutWizardProps = {
            name: 'test-wiz',
            exitPath: '/',
            ...props,
        };

        const Component = await LayoutWizard(completeProps);
        return Component;
    };

    it('renders the navigation wizard component and children property', async () => {
        const children = 'test-children';
        render(await createTestComponent({ children }));
        expect(screen.getByTestId('navigation-wizard-mock')).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('prefetches the DAO and its settings from the given slug', async () => {
        const daoEns = 'test.dao.eth';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const params = { addressOrEns: daoEns, network: daoNetwork };
        const expectedDaoId = 'test-dao-id';
        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            daoOptions({ urlParams: { id: expectedDaoId } }).queryKey,
        );
    });

    it('does not prefetch the DAO data when the DAO id is not provided by params', async () => {
        render(await createTestComponent());
        expect(fetchQuerySpy).not.toHaveBeenCalled();
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
        const params = { addressOrEns: 'test.dao.eth', network: Network.ETHEREUM_MAINNET };
        fetchQuerySpy.mockRejectedValue('error');

        render(await createTestComponent({ params: Promise.resolve(params) }));
        const errorLink = screen.getByRole('link', { name: /layoutWizard.notFound.action/ });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(`/`);
    });
});
