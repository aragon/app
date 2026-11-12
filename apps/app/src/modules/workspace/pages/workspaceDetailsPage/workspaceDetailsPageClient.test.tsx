import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import * as useWorkspaceTodoDataModule from '../../hooks/useWorkspaceTodoData';
import {
    type IWorkspaceDetailsPageClientProps,
    WorkspaceDetailsPageClient,
} from './workspaceDetailsPageClient';

describe('<WorkspaceDetailsPageClient /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const targetAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const walletAddress = '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    // The real hook subscribes to the wagmi connection, which the page is not rendered under here; the to-do reader
    // is tested on its own.
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const useWorkspaceTodoDataSpy = jest.spyOn(
        useWorkspaceTodoDataModule,
        'useWorkspaceTodoData',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const mockWallet = (connectedAddress?: string) =>
        useWalletAccountSpy.mockReturnValue({
            address: connectedAddress,
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);

    let testIndex = 0;

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => {
        testIndex += 1;

        return {
            id: `test-workspace-${testIndex.toString()}`,
            name: 'Test Workspace',
            description: 'A test workspace',
            avatar: null,
            links: [],
            accounts: [
                {
                    id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
                    type: WorkspaceAccountType.DAO,
                    address,
                    network: Network.ETHEREUM_SEPOLIA,
                },
            ],
            targets: [],
            ...workspace,
        };
    };

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        getAccountsSpy.mockResolvedValue([
            {
                network: Network.ETHEREUM_SEPOLIA,
                address,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            },
        ]);
        mockWallet(undefined);
        useWorkspaceTodoDataSpy.mockReturnValue({
            todos: [],
            isPending: false,
            isError: false,
            hasUnreadableAccounts: false,
        });
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        useWalletAccountSpy.mockReset();
        useWorkspaceTodoDataSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceDetailsPageClientProps>,
    ) => {
        const completeProps: IWorkspaceDetailsPageClientProps = {
            workspaceId: 'test-workspace',
            ...props,
        };

        // The query client must sit inside the gov-ui-kit provider, which carries a query client of its own that
        // would otherwise shadow this one.
        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceDetailsPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    // The registry resolves a workspace by ID, so the page is rendered for the ID of the one being tested.
    const renderWorkspace = (workspace: IWorkspace) => {
        getWorkspaceSpy.mockResolvedValue(workspace);

        return render(createTestComponent({ workspaceId: workspace.id }));
    };

    it('renders nothing until the workspace resolves, the gate above owning that state', () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });

    it('displays the workspace metadata on the page header', async () => {
        renderWorkspace(buildWorkspace());

        expect(await screen.findByText('Test Workspace')).toBeInTheDocument();
        expect(screen.getByText('A test workspace')).toBeInTheDocument();
    });

    it('displays the accounts with the name resolved by the accounts API', async () => {
        renderWorkspace(buildWorkspace());

        expect(
            await screen.findByText(/workspaceDetailsPage\.section\.accounts$/),
        ).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByText('Demo DAO')).toBeInTheDocument(),
        );
    });

    it('displays the to-do section above the accounts for a connected wallet', async () => {
        mockWallet(walletAddress);
        renderWorkspace(buildWorkspace());

        const todoTitle = await screen.findByText(
            /workspaceDetailsPage\.section\.todos$/,
        );
        const accountsTitle = screen.getByText(
            /workspaceDetailsPage\.section\.accounts$/,
        );

        expect(
            todoTitle.compareDocumentPosition(accountsTitle) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it('asks to connect a wallet in the to-do section when none is connected', async () => {
        renderWorkspace(buildWorkspace());

        expect(await screen.findByText('Test Workspace')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceTodoList\.connect\.heading$/),
        ).toBeInTheDocument();
    });

    it('hides the to-do section for a workspace without accounts', async () => {
        renderWorkspace(buildWorkspace({ accounts: [] }));

        expect(await screen.findByText('Test Workspace')).toBeInTheDocument();
        expect(
            screen.queryByText(/workspaceDetailsPage\.section\.todos$/),
        ).not.toBeInTheDocument();
    });

    it('hides the targets section when the workspace has no target', async () => {
        renderWorkspace(buildWorkspace());

        expect(await screen.findByText('Test Workspace')).toBeInTheDocument();
        expect(
            screen.queryByText(/workspaceDetailsPage\.section\.targets$/),
        ).not.toBeInTheDocument();
    });

    it('displays the targets section when the workspace has targets', async () => {
        renderWorkspace(
            buildWorkspace({
                targets: [
                    { address: targetAddress, network: Network.CITREA_MAINNET },
                ],
            }),
        );

        expect(
            await screen.findByText(/workspaceDetailsPage\.section\.targets$/),
        ).toBeInTheDocument();
    });

    it('links a workspace with no account to its edit wizard to add some', async () => {
        const workspace = buildWorkspace({ accounts: [] });
        renderWorkspace(workspace);

        expect(
            await screen.findByText(
                /workspaceDetailsPage\.emptyAccounts\.heading$/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: /workspaceDetailsPage\.emptyAccounts\.action$/,
            }),
        ).toHaveAttribute(
            'href',
            `/workspace/${workspace.id}/edit?step=ACCOUNTS`,
        );
    });

    it('opens DAO creation from a workspace with no account', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        renderWorkspace(buildWorkspace({ accounts: [] }));

        await userEvent.click(
            await screen.findByRole('button', {
                name: /workspaceDetailsPage\.emptyAccounts\.createAction$/,
            }),
        );

        expect(open).toHaveBeenCalledWith(CreateDaoDialogId.CREATE_DAO_DETAILS);
    });

    it('hides the empty accounts state when the workspace has accounts', async () => {
        renderWorkspace(buildWorkspace());

        expect(await screen.findByText('Test Workspace')).toBeInTheDocument();
        expect(
            screen.queryByText(/workspaceDetailsPage\.emptyAccounts\.heading$/),
        ).not.toBeInTheDocument();
    });

    it('does not resolve accounts for a workspace that has none', async () => {
        renderWorkspace(buildWorkspace({ accounts: [] }));

        expect(await screen.findByText('Test Workspace')).toBeInTheDocument();
        expect(getAccountsSpy).not.toHaveBeenCalled();
    });
});
