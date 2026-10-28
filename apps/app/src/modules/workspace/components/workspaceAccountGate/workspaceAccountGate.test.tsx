import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { type IDao, Network } from '@/shared/api/daoService';
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
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');

    let daoResult: IDao | Error;

    beforeEach(() => {
        daoResult = generateDao();

        fetchQuerySpy.mockImplementation(() =>
            daoResult instanceof Error
                ? Promise.reject(daoResult)
                : Promise.resolve(daoResult),
        );
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAccountGateProps>,
    ) => {
        const completeProps: IWorkspaceAccountGateProps = {
            accountId,
            ...props,
        };

        return await WorkspaceAccountGate({
            ...completeProps,
            children: completeProps.children ?? <div data-testid="page-mock" />,
        });
    };

    it('renders the page when the DAO record of the account can be read', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('gate-error-mock')).not.toBeInTheDocument();
    });

    // A Safe has no DAO record, so this is also what a Safe account gets on every section that has no Safe
    // counterpart yet — see "Safe support by route" in `docs/projectDocs/createWorkspace.md`.
    it('renders the error state when the DAO record cannot be read', async () => {
        daoResult = new Error('not found');
        render(await createTestComponent());

        expect(screen.getByTestId('gate-error-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('page-mock')).not.toBeInTheDocument();
    });

    it('reads the DAO of the account it is given', async () => {
        await createTestComponent();

        expect(fetchQuerySpy).toHaveBeenCalledTimes(1);
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ urlParams: { id: accountId } }),
            ]),
        );
    });

    // The gate adds no boundary of its own: whatever the page renders is what the route renders.
    it('wraps the page in nothing', async () => {
        const children = <div data-testid="bare-child" />;
        const result = await createTestComponent({ children });

        expect(result).toEqual(children);
    });
});
