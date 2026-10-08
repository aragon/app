import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { daoOptions, Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import {
    type IWorkspaceAccountGateProps,
    WorkspaceAccountGate,
} from './workspaceAccountGate';

// Rendered as a marker so the assertion below can show the gate wraps the page in no boundary of its own.
jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock">{props.children}</div>
    ),
}));

jest.mock('./workspaceAccountGateError', () => ({
    WorkspaceAccountGateError: () => <div data-testid="gate-error-mock" />,
}));

describe('<WorkspaceAccountGate /> component', () => {
    const accountId = `${Network.ETHEREUM_SEPOLIA}-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5`;

    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue(generateDao());
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAccountGateProps>,
    ) => {
        const completeProps: IWorkspaceAccountGateProps = {
            accountId,
            children: <div data-testid="page-mock" />,
            ...props,
        };

        return await WorkspaceAccountGate(completeProps);
    };

    it('fetches the DAO of the account on the server', async () => {
        await createTestComponent();

        const [options] = fetchQuerySpy.mock.calls[0] as [
            { queryKey: unknown[] },
        ];
        expect(options.queryKey).toEqual(
            daoOptions({ urlParams: { id: accountId } }).queryKey,
        );
    });

    it('renders the page once the DAO of the account has resolved', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('gate-error-mock')).not.toBeInTheDocument();
    });

    // `LayoutWorkspaceAccount`, which every page using the gate renders inside, has already hydrated the same
    // query. Hydrating it again would serialize a second copy of it for the client to discard.
    it('leaves the hydration of the DAO to the layout above it', async () => {
        render(await createTestComponent());

        expect(screen.queryByTestId('hydration-mock')).not.toBeInTheDocument();
    });

    it('renders an error instead of the page when the DAO fails to load', async () => {
        fetchQuerySpy.mockRejectedValue(new Error('dao error'));
        render(await createTestComponent());

        expect(screen.getByTestId('gate-error-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('page-mock')).not.toBeInTheDocument();
    });
});
