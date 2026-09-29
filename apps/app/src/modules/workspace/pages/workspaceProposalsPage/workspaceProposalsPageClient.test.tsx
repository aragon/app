import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { DaoProposalList } from '@/modules/governance/components/daoProposalList';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import * as workspaceAccountSelectorProvider from '../../components/workspaceAccountSelectorProvider';
import { WorkspaceProposalList } from '../../components/workspaceProposalList';
import {
    type IWorkspaceProposalsPageClientProps,
    WorkspaceProposalsPageClient,
} from './workspaceProposalsPageClient';

jest.mock('@/modules/governance/components/daoProposalList', () => ({
    DaoProposalList: jest.fn(() => (
        <div data-testid="dao-proposal-list-mock" />
    )),
}));

jest.mock('../../components/workspaceProposalList', () => ({
    WorkspaceProposalList: jest.fn(() => (
        <div data-testid="workspace-proposal-list-mock" />
    )),
}));

jest.mock('../../components/workspaceProposalsAsideCard', () => ({
    WorkspaceProposalsAsideCard: () => <div />,
}));

// The page opens the create-proposal flow, which needs the dialog and router context of the application shell.
jest.mock('@/shared/components/dialogProvider', () => ({
    useDialogContext: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/modules/governance/hooks/usePermissionCheckGuard', () => ({
    usePermissionCheckGuard: () => ({ check: jest.fn() }),
}));

describe('<WorkspaceProposalsPageClient /> component', () => {
    const firstAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const secondAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const useWorkspaceAccountSelectorContextSpy = jest.spyOn(
        workspaceAccountSelectorProvider,
        'useWorkspaceAccountSelectorContext',
    );
    const daoProposalListMock = DaoProposalList as jest.Mock;
    const workspaceProposalListMock = WorkspaceProposalList as jest.Mock;

    const buildAccount = (address: string): IWorkspaceAccount => ({
        id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_SEPOLIA,
    });

    const firstAccount = buildAccount(firstAddress);
    const secondAccount = buildAccount(secondAddress);

    const buildOption = (
        account: IWorkspaceAccount,
    ): workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption => ({
        id: account.id,
        label: account.id,
        account,
        isAllAccounts: false,
    });

    const allAccountsOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        { id: 'all', label: 'All accounts', isAllAccounts: true };

    const buildWorkspace = (): IWorkspace => ({
        id: 'demo',
        name: 'Demo workspace',
        description: '',
        avatar: null,
        links: [],
        owner: firstAddress,
        accounts: [firstAccount, secondAccount],
        targets: [],
    });

    const mockAccountSelector = (
        context?: Partial<workspaceAccountSelectorProvider.IWorkspaceAccountSelectorContext>,
    ) =>
        useWorkspaceAccountSelectorContextSpy.mockReturnValue({
            activeOption: allAccountsOption,
            setActiveOption: jest.fn(),
            options: [
                allAccountsOption,
                buildOption(firstAccount),
                buildOption(secondAccount),
            ],
            ...context,
        });

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        mockAccountSelector();
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        useWorkspaceAccountSelectorContextSpy.mockReset();
        daoProposalListMock.mockClear();
        workspaceProposalListMock.mockClear();
        localStorage.clear();
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

    it('aggregates the proposals of every account by default', async () => {
        render(createTestComponent());

        expect(
            await screen.findByTestId('workspace-proposal-list-mock'),
        ).toBeInTheDocument();
        expect(daoProposalListMock).not.toHaveBeenCalled();
    });

    it('displays the proposals of the selected account', async () => {
        mockAccountSelector({ activeOption: buildOption(firstAccount) });
        render(createTestComponent());

        expect(
            await screen.findByTestId('dao-proposal-list-mock'),
        ).toBeInTheDocument();
        expect(daoProposalListMock.mock.calls.at(-1)?.[0]).toEqual(
            expect.objectContaining({
                initialParams: expect.objectContaining({
                    queryParams: expect.objectContaining({
                        daoId: firstAccount.id,
                    }),
                }),
            }),
        );
    });

    // The list keeps its body tab on the URL, so it has to be a new list when the account changes — otherwise the
    // parameter outlives the account it belongs to and names a body the new one does not have.
    it('starts a new list when the selected account changes', async () => {
        mockAccountSelector({ activeOption: buildOption(firstAccount) });
        const { rerender } = render(createTestComponent());

        const firstInstance = await screen.findByTestId(
            'dao-proposal-list-mock',
        );

        mockAccountSelector({ activeOption: buildOption(secondAccount) });
        rerender(createTestComponent());

        const secondInstance = await screen.findByTestId(
            'dao-proposal-list-mock',
        );
        expect(secondInstance).not.toBe(firstInstance);
    });
});
