import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { daoService, type IDao, Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import type { IWorkspaceProposalListProps } from '../../components/workspaceProposalList';
import type { IWorkspaceProposalsAsideCardProps } from '../../components/workspaceProposalsAsideCard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type {
    IUseWorkspaceAccountOptionsResult,
    IWorkspaceAccountOption,
} from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import {
    type IWorkspaceProposalsPageClientProps,
    WorkspaceProposalsPageClient,
} from './workspaceProposalsPageClient';

jest.mock('../../components/workspaceProposalList', () => ({
    WorkspaceProposalList: jest.fn(() => <div data-testid="list-mock" />),
}));

jest.mock('../../components/workspaceProposalsAsideCard', () => ({
    WorkspaceProposalsAsideCard: jest.fn(() => (
        <div data-testid="aside-card-mock" />
    )),
}));

describe('<WorkspaceProposalsPageClient /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );

    const openMock = jest.fn();

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'demo',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        owner: daoAddress,
        accounts: [daoAccount, safeAccount],
        targets: [],
        ...workspace,
    });

    const mockAccountOptions = (
        result?: Partial<IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [allAccountsOption],
            accountId: allAccountsOption.id,
            activeOption: allAccountsOption,
            isAllAccounts: true,
            ...result,
        });

    const lastListProps = () =>
        (
            jest.requireMock('../../components/workspaceProposalList')
                .WorkspaceProposalList as jest.Mock
        ).mock.calls.at(-1)?.[0] as IWorkspaceProposalListProps | undefined;

    const lastAsideCardProps = () =>
        (
            jest.requireMock('../../components/workspaceProposalsAsideCard')
                .WorkspaceProposalsAsideCard as jest.Mock
        ).mock.calls.at(-1)?.[0] as
            | IWorkspaceProposalsAsideCardProps
            | undefined;

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        getDaoSpy.mockResolvedValue(generateDao({ id: daoAccount.id }));
        mockAccountOptions();
        useDialogContextSpy.mockReturnValue({
            open: openMock,
            close: jest.fn(),
        } as unknown as ReturnType<typeof dialogProvider.useDialogContext>);
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getDaoSpy.mockReset();
        useDialogContextSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
        openMock.mockClear();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceProposalsPageClientProps>,
    ) => {
        const completeProps: IWorkspaceProposalsPageClientProps = {
            workspaceId: 'demo',
            pageSize: 10,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceProposalsPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    // Only DAO accounts have indexed proposals, so a Safe never reaches the list.
    it('lists the proposals of every DAO account of the workspace', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(screen.getByTestId('list-mock')).toBeInTheDocument();
    });

    it('passes the page size to the list and the aside card, so both read under one key', async () => {
        render(createTestComponent({ pageSize: 25 }));

        await waitFor(() => expect(lastListProps()?.pageSize).toEqual(25));
        expect(lastAsideCardProps()?.pageSize).toEqual(25);
    });

    it('describes the whole workspace on the aside', async () => {
        render(createTestComponent());

        // Waits on the accounts rather than the option: the option comes from the hook on the first render, while
        // the accounts only arrive once the workspace resolves.
        await waitFor(() =>
            expect(lastAsideCardProps()?.accounts).toEqual([daoAccount]),
        );
        expect(lastAsideCardProps()?.activeOption).toEqual(allAccountsOption);
    });

    // The page aggregates every account, so which one a new proposal belongs to is always the first thing to ask.
    it('asks which account a new proposal belongs to', async () => {
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        );

        expect(openMock).toHaveBeenCalledWith(
            WorkspaceDialogId.SELECT_ACCOUNT,
            expect.objectContaining({
                params: expect.objectContaining({
                    accounts: [daoAccount],
                    variant: 'proposal',
                }),
            }),
        );
    });

    // The create flow resolves its destination from the DAOs, so the action waits for them.
    it('offers proposal creation only once the DAOs of the workspace are loaded', async () => {
        let resolveDao: (dao: IDao) => void = () => undefined;
        getDaoSpy.mockReturnValue(
            new Promise((resolve) => {
                resolveDao = resolve;
            }),
        );
        render(createTestComponent());

        await waitFor(() =>
            expect(lastListProps()?.accounts).toEqual([daoAccount]),
        );
        expect(
            screen.queryByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        ).not.toBeInTheDocument();

        resolveDao(generateDao({ id: daoAccount.id }));

        expect(
            await screen.findByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        ).toBeInTheDocument();
    });

    it('offers no proposal creation for a workspace without DAO accounts', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [safeAccount] }),
        );
        render(createTestComponent());

        await waitFor(() => expect(lastListProps()?.accounts).toEqual([]));
        expect(
            screen.queryByRole('button', {
                name: /workspaceProposalsPage\.main\.action$/,
            }),
        ).not.toBeInTheDocument();
    });
});
