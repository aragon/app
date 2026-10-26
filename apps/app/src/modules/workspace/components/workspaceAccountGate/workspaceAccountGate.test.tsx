import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { type IDao, Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import {
    type IWorkspaceAccountGateProps,
    WorkspaceAccountGate,
} from './workspaceAccountGate';
import type { IWorkspaceAccountGateErrorProps } from './workspaceAccountGateError';

// Rendered as a marker so the assertion below can show the gate wraps the page in no boundary of its own.
jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock">{props.children}</div>
    ),
}));

// The states themselves belong to the error component's tests; here only which one the gate picks matters.
jest.mock('./workspaceAccountGateError', () => ({
    WorkspaceAccountGateError: (props: IWorkspaceAccountGateErrorProps) => (
        <p>{`gate error: ${props.accountState ?? 'unknown'}`}</p>
    ),
}));

describe('<WorkspaceAccountGate /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

    let daoResult: IDao | Error;

    const buildAccountInfo = (
        accountInfo?: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        network: Network.ETHEREUM_SEPOLIA,
        address,
        type: WorkspaceAccountInfoType.SAFE,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: false,
        ...accountInfo,
    });

    beforeEach(() => {
        daoResult = generateDao();

        fetchQuerySpy.mockImplementation(() =>
            daoResult instanceof Error
                ? Promise.reject(daoResult)
                : Promise.resolve(daoResult),
        );
        getAccountsSpy.mockResolvedValue([buildAccountInfo()]);
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        getAccountsSpy.mockReset();
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
            children: completeProps.children ?? <p>page</p>,
        });
    };

    it('renders the page when the DAO record of the account can be read', async () => {
        render(await createTestComponent());

        expect(screen.getByText('page')).toBeInTheDocument();
        expect(screen.queryByText(/gate error/)).not.toBeInTheDocument();
    });

    it('looks nothing up when the DAO record can be read', async () => {
        await createTestComponent();

        expect(getAccountsSpy).not.toHaveBeenCalled();
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
        const children = <p>bare child</p>;
        const result = await createTestComponent({ children });

        expect(result).toEqual(children);
    });

    describe('when the DAO record cannot be read', () => {
        beforeEach(() => {
            daoResult = new Error('not found');
        });

        it('looks the account up with a single-account request', async () => {
            await createTestComponent();

            expect(getAccountsSpy).toHaveBeenCalledWith({
                body: {
                    accounts: [{ network: Network.ETHEREUM_SEPOLIA, address }],
                },
            });
        });

        it.each([
            {
                outcome: 'a Safe',
                accountInfo: buildAccountInfo(),
                expected: WorkspaceAccountState.SAFE,
            },
            {
                outcome: 'an unsupported address',
                accountInfo: buildAccountInfo({
                    type: WorkspaceAccountInfoType.UNKNOWN,
                    status: WorkspaceAccountInfoStatus.UNSUPPORTED,
                }),
                expected: WorkspaceAccountState.NOT_FOUND,
            },
            {
                outcome: 'an unavailable source',
                accountInfo: buildAccountInfo({
                    type: WorkspaceAccountInfoType.UNKNOWN,
                    status: WorkspaceAccountInfoStatus.UNAVAILABLE,
                }),
                expected: WorkspaceAccountState.UNAVAILABLE,
            },
            {
                outcome: 'a DAO whose record failed to load',
                accountInfo: buildAccountInfo({
                    type: WorkspaceAccountInfoType.DAO,
                    indexed: true,
                }),
                expected: WorkspaceAccountState.DAO,
            },
        ])(
            'renders the $expected state for $outcome',
            async ({ accountInfo, expected }) => {
                getAccountsSpy.mockResolvedValue([accountInfo]);
                render(await createTestComponent());

                expect(
                    screen.getByText(`gate error: ${expected}`),
                ).toBeInTheDocument();
                expect(screen.queryByText('page')).not.toBeInTheDocument();
            },
        );

        // The endpoint 404s the whole request for an address that is neither a DAO nor a Safe.
        it('renders the not-found state when the lookup is not found', async () => {
            getAccountsSpy.mockRejectedValue(
                new AragonBackendServiceError(
                    AragonBackendServiceError.notFoundCode,
                    'Resource not found',
                    404,
                ),
            );
            render(await createTestComponent());

            expect(
                screen.getByText(
                    `gate error: ${WorkspaceAccountState.NOT_FOUND}`,
                ),
            ).toBeInTheDocument();
        });

        it('renders the generic error when the lookup fails otherwise', async () => {
            getAccountsSpy.mockRejectedValue(
                new Error('Internal server error'),
            );
            render(await createTestComponent());

            expect(screen.getByText('gate error: unknown')).toBeInTheDocument();
        });
    });
});
