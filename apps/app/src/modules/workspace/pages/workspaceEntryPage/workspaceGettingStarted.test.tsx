import { GukModulesProvider } from '@aragon/gov-ui-kit';
import * as AppKit from '@reown/appkit/react';
import { QueryClient } from '@tanstack/react-query';
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import type { INavigationWizardProps } from '@/modules/application/components/navigations/navigationWizard';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import * as useWalletConnectedModule from '@/modules/application/hooks/useWalletConnected';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import {
    WorkspaceAccountSuggestionRole,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import * as workspaceAccountSelectModule from '../../components/workspaceAccountSelect';
import * as useWorkspaceAccountSuggestionsModule from '../../hooks/useWorkspaceAccountSuggestions';
import * as useWorkspaceCreateAccountDialogModule from '../../hooks/useWorkspaceCreateAccountDialog';
import { workspaceWelcomeUtils } from '../../utils/workspaceWelcomeUtils';
import { WorkspaceGettingStarted } from './workspaceGettingStarted';

jest.mock(
    '@/modules/application/components/navigations/navigationWizard',
    () => ({
        NavigationWizard: (props: INavigationWizardProps) => (
            <a href="/" onClick={props.onExit}>
                close
            </a>
        ),
    }),
);

describe('<WorkspaceGettingStarted /> component', () => {
    const buildAccount = (address: string): IWorkspaceAccount => ({
        id: `${Network.ETHEREUM_MAINNET}-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_MAINNET,
    });

    const first = buildAccount('0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5');
    const second = buildAccount('0x1F01e6fe406295c9fe42189A2ef999636a04132a');

    const workspace: IWorkspace = {
        id: 'my-workspace-1a2b3c4d',
        name: 'My workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [],
        targets: [],
    };

    const createDefaultWorkspaceSpy = jest.spyOn(
        workspaceService,
        'createDefaultWorkspace',
    );
    const selectSpy = jest.spyOn(
        workspaceAccountSelectModule,
        'WorkspaceAccountSelect',
    );
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useDisconnectSpy = jest.spyOn(AppKit, 'useDisconnect');
    const useWalletConnectedSpy = jest.spyOn(
        useWalletConnectedModule,
        'useWalletConnected',
    );
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    // Kept before the spy replaces it, for the test that reads the suggestions for real.
    const { useWorkspaceAccountSuggestions } =
        useWorkspaceAccountSuggestionsModule;
    const useSuggestionsSpy = jest.spyOn(
        useWorkspaceAccountSuggestionsModule,
        'useWorkspaceAccountSuggestions',
    );
    const useCreateAccountDialogSpy = jest.spyOn(
        useWorkspaceCreateAccountDialogModule,
        'useWorkspaceCreateAccountDialog',
    );
    const openCreateAccountMock = jest.fn();

    const replaceMock = jest.fn();
    const pushMock = jest.fn();
    const prefetchMock = jest.fn();
    const openMock = jest.fn();
    const disconnectMock = jest.fn();

    const wallet = '0x5dcD623bf6E792bfBDbf8d643f6478153df4A8D2';
    const otherWallet = '0x069f5b3F048726CC62D518F8B7D1F8a64B29EFA4';

    const mockWalletAddress = (address?: string) =>
        useWalletAccountSpy.mockReturnValue({
            address,
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);

    const mockSuggestions = (
        result: Partial<
            ReturnType<
                typeof useWorkspaceAccountSuggestionsModule.useWorkspaceAccountSuggestions
            >
        > = {},
    ) =>
        useSuggestionsSpy.mockReturnValue({
            suggestions: [
                { account: first, role: WorkspaceAccountSuggestionRole.MEMBER },
            ],
            isPending: false,
            isError: false,
            isIncomplete: false,
            refetch: jest.fn(),
            ...result,
        });

    beforeEach(() => {
        createDefaultWorkspaceSpy.mockResolvedValue(workspace);
        // Stands in for the selector: one button per selection it can report.
        selectSpy.mockImplementation(({ onChange, onModeChange }) => (
            <div>
                <button onClick={() => onChange([first])} type="button">
                    pick one
                </button>
                <button onClick={() => onChange([first, second])} type="button">
                    pick two
                </button>
                <button onClick={() => onModeChange?.('list')} type="button">
                    back to list
                </button>
            </div>
        ));
        useRouterSpy.mockReturnValue({
            replace: replaceMock,
            push: pushMock,
            prefetch: prefetchMock,
        } as unknown as AppRouterInstance);
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openMock }),
        );
        useDisconnectSpy.mockReturnValue({
            disconnect: disconnectMock,
        } as unknown as ReturnType<typeof AppKit.useDisconnect>);
        useWalletConnectedSpy.mockReturnValue(true);
        mockWalletAddress(wallet);
        mockSuggestions();
        useCreateAccountDialogSpy.mockReturnValue(openCreateAccountMock);
    });

    afterEach(() => {
        createDefaultWorkspaceSpy.mockReset();
        selectSpy.mockReset();
        useRouterSpy.mockReset();
        useDialogContextSpy.mockReset();
        useDisconnectSpy.mockReset();
        useWalletConnectedSpy.mockReset();
        useWalletAccountSpy.mockReset();
        useSuggestionsSpy.mockReset();
        useCreateAccountDialogSpy.mockReset();
        openCreateAccountMock.mockReset();
        replaceMock.mockReset();
        pushMock.mockReset();
        prefetchMock.mockReset();
        openMock.mockReset();
        localStorage.clear();
        disconnectMock.mockReset();
    });

    // The kit provider brings its own query client, so the app's one goes inside it.
    const createTestComponent = (queryClient?: QueryClient) => (
        <GukModulesProvider>
            <ReactQueryWrapper client={queryClient}>
                <WorkspaceGettingStarted />
            </ReactQueryWrapper>
        </GukModulesProvider>
    );

    const getAddButton = () =>
        screen.getByRole('button', {
            name: /workspaceGettingStarted.action.add/,
        });
    const getLaterButton = () =>
        screen.getByRole('button', {
            name: /workspaceGettingStarted.action.later/,
        });

    it('creates the workspace with no account, owes the welcome dialog and goes to it', async () => {
        render(createTestComponent());

        await userEvent.click(getLaterButton());

        await waitFor(() =>
            expect(replaceMock).toHaveBeenCalledWith(
                `/workspace/${workspace.id}/all/overview`,
            ),
        );
        expect(createDefaultWorkspaceSpy).toHaveBeenCalledWith([]);
        expect(workspaceWelcomeUtils.isWelcomePending()).toBe(true);
    });

    it('creates the workspace with the selected accounts', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByText('pick two'));
        expect(getAddButton()).toHaveTextContent(
            'app.workspace.workspaceGettingStarted.action.addMany (count=2)',
        );
        await userEvent.click(getAddButton());

        await waitFor(() => expect(replaceMock).toHaveBeenCalled());
        expect(createDefaultWorkspaceSpy).toHaveBeenCalledWith([first, second]);
    });

    it('disables adding until an account is picked', async () => {
        render(createTestComponent());

        expect(getAddButton()).toBeDisabled();
        expect(getAddButton()).toHaveTextContent(
            'app.workspace.workspaceGettingStarted.action.add',
        );

        await userEvent.click(screen.getByText('pick one'));
        expect(getAddButton()).toHaveTextContent(
            'app.workspace.workspaceGettingStarted.action.addOne',
        );
    });

    it('creates one workspace only on a double click', async () => {
        createDefaultWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        fireEvent.click(getLaterButton());
        fireEvent.click(getLaterButton());

        await waitFor(() =>
            expect(createDefaultWorkspaceSpy).toHaveBeenCalled(),
        );
        expect(createDefaultWorkspaceSpy).toHaveBeenCalledTimes(1);
    });

    it('shows an error and keeps the selection when the workspace cannot be created', async () => {
        createDefaultWorkspaceSpy.mockRejectedValueOnce(new Error('storage'));
        render(createTestComponent());

        await userEvent.click(screen.getByText('pick one'));
        await userEvent.click(getAddButton());

        expect(
            await screen.findByText(
                'app.workspace.workspaceGettingStarted.error',
            ),
        ).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
        expect(getAddButton()).toBeEnabled();
        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: [first] }),
            undefined,
        );

        await userEvent.click(getAddButton());
        await waitFor(() => expect(replaceMock).toHaveBeenCalled());
    });

    it('opens the create account dialog and selects the account it creates', async () => {
        const created = buildAccount(
            '0x9cE7B2b1F8a1A7d2dF0E43a4f7C2B1a3E5d6C7b8',
        );
        render(createTestComponent());

        await userEvent.click(screen.getByText('pick one'));
        const createButton = screen.getByRole('button', {
            name: 'app.workspace.workspaceGettingStarted.action.createAccount',
        });
        expect(createButton).toHaveClass('bg-neutral-0');
        await userEvent.click(createButton);

        expect(openCreateAccountMock).toHaveBeenCalledWith({
            onCreated: expect.any(Function),
        });
        const [{ onCreated }] = openCreateAccountMock.mock.calls[0];
        act(() => onCreated(created));

        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: [first, created] }),
            undefined,
        );
        expect(pushMock).not.toHaveBeenCalled();
    });

    it('tells how far the scan of the networks is while suggestions load', () => {
        mockSuggestions({ isPending: true });
        render(createTestComponent());

        expect(screen.getByRole('status')).toHaveTextContent(
            /workspaceGettingStarted.scanning.*found=1/,
        );
    });

    it('does not show the scan status while the suggestions are read again in the background', async () => {
        useSuggestionsSpy
            .mockReset()
            .mockImplementation(useWorkspaceAccountSuggestions);
        const getAccountSuggestionsSpy = jest
            .spyOn(workspaceQueryService, 'getAccountSuggestions')
            .mockResolvedValueOnce({
                data: [
                    {
                        account: first,
                        role: WorkspaceAccountSuggestionRole.MEMBER,
                    },
                ],
                metadata: {
                    page: 1,
                    pageSize: 1,
                    totalPages: 1,
                    totalRecords: 1,
                },
                isIncomplete: false,
            })
            .mockReturnValueOnce(new Promise(() => undefined));
        const queryClient = new QueryClient();
        render(createTestComponent(queryClient));
        expect(await screen.findByRole('status')).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.queryByRole('status')).not.toBeInTheDocument(),
        );

        act(() => void queryClient.invalidateQueries());

        await waitFor(() =>
            expect(getAccountSuggestionsSpy).toHaveBeenCalledTimes(2),
        );
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        getAccountSuggestionsSpy.mockRestore();
    });

    it('warns outside the selector when accounts could not be loaded, and retries', async () => {
        const refetch = jest.fn();
        mockSuggestions({ isIncomplete: true, refetch });
        render(createTestComponent());

        expect(
            screen.getByText('app.workspace.workspaceAccountSelect.incomplete'),
        ).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceAccountSelect.retry',
            }),
        );
        expect(refetch).toHaveBeenCalled();
    });

    it('shows only an empty card when the wallet has no accounts', () => {
        mockSuggestions({ suggestions: [] });
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).toBeInTheDocument();
        expect(selectSpy).not.toHaveBeenCalled();
        expect(
            screen.queryByRole('button', {
                name: /workspaceGettingStarted.action.later/,
            }),
        ).not.toBeInTheDocument();
    });

    it('selects the account created from the empty card, which gives way to the selector', async () => {
        mockSuggestions({ suggestions: [] });
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.action.createAccount',
            }),
        );

        const [{ onCreated }] = openCreateAccountMock.mock.calls[0];
        act(() => onCreated(first));
        // Already selected: not added twice.
        act(() => onCreated(first));

        expect(
            screen.queryByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).not.toBeInTheDocument();
        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: [first] }),
            undefined,
        );
        expect(getAddButton()).toBeEnabled();
    });

    it('keeps the selector once an account was created from the empty card, even unchecked', async () => {
        mockSuggestions({ suggestions: [] });
        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.action.createAccount',
            }),
        );

        const [{ onCreated }] = openCreateAccountMock.mock.calls[0];
        act(() => onCreated(first));
        act(() => selectSpy.mock.lastCall?.[0].onChange([]));

        expect(
            screen.queryByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).not.toBeInTheDocument();
        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: [] }),
            undefined,
        );
    });

    it('opens the selector on its address view from the empty card', async () => {
        mockSuggestions({ suggestions: [] });
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.emptyState.addByAddress',
            }),
        );

        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ initialMode: 'address' }),
            undefined,
        );
        expect(
            screen.queryByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).not.toBeInTheDocument();
        expect(getLaterButton()).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.action.createAccount',
            }),
        ).toHaveClass('bg-primary-400');
    });

    it('brings the empty card back when the address view closes with nothing added', async () => {
        mockSuggestions({ suggestions: [] });
        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.emptyState.addByAddress',
            }),
        );

        await userEvent.click(screen.getByText('back to list'));

        expect(
            screen.getByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).toBeInTheDocument();
    });

    it('keeps the selector once an account was added by address, even unchecked', async () => {
        mockSuggestions({ suggestions: [] });
        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.emptyState.addByAddress',
            }),
        );

        await userEvent.click(screen.getByText('pick one'));
        await userEvent.click(screen.getByText('back to list'));
        act(() => selectSpy.mock.lastCall?.[0].onChange([]));

        expect(await screen.findByText('back to list')).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).not.toBeInTheDocument();
    });

    it('shows the empty card to a switched wallet with no accounts, whatever the last one picked', async () => {
        const { rerender } = render(createTestComponent());
        await userEvent.click(screen.getByText('pick one'));

        mockWalletAddress(otherWallet);
        mockSuggestions({ suggestions: [] });
        rerender(createTestComponent());

        expect(
            screen.getByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).toBeInTheDocument();
    });

    it('keeps the selector, with creating primary, when an incomplete scan found nothing', () => {
        mockSuggestions({ suggestions: [], isIncomplete: true });
        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).not.toBeInTheDocument();
        expect(screen.getByText('pick one')).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.action.createAccount',
            }),
        ).toHaveClass('bg-primary-400');
    });

    it('keeps the selection reachable, with creating secondary, when the suggestions are read again with none left', async () => {
        const { rerender } = render(createTestComponent());
        await userEvent.click(screen.getByText('pick one'));

        mockSuggestions({ suggestions: [] });
        rerender(createTestComponent());

        expect(
            screen.queryByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /workspaceGettingStarted.action.addOne/,
            }),
        ).toBeEnabled();
        expect(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.action.createAccount',
            }),
        ).toHaveClass('bg-neutral-0');
    });

    it('shows the empty card to a switched wallet with no accounts, even after an account was added by address', async () => {
        mockSuggestions({ suggestions: [] });
        const { rerender } = render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceGettingStarted.emptyState.addByAddress',
            }),
        );
        await userEvent.click(screen.getByText('pick one'));
        await userEvent.click(screen.getByText('back to list'));

        mockWalletAddress(otherWallet);
        rerender(createTestComponent());

        expect(
            screen.getByText(
                'app.workspace.workspaceGettingStarted.emptyState.heading',
            ),
        ).toBeInTheDocument();
    });

    it('prefetches the landing page on mount', () => {
        render(createTestComponent());

        expect(prefetchMock).toHaveBeenCalledWith('/');
    });

    it('returns to the landing page without prompting to reconnect when the wallet disconnects', () => {
        const { rerender } = render(createTestComponent());
        expect(replaceMock).not.toHaveBeenCalled();

        useWalletConnectedSpy.mockReturnValue(false);
        rerender(createTestComponent());

        expect(replaceMock).toHaveBeenCalledWith('/');
        expect(openMock).not.toHaveBeenCalledWith(
            ApplicationDialogId.CONNECT_WALLET,
            expect.anything(),
        );
        expect(openMock).not.toHaveBeenCalledWith(
            ApplicationDialogId.CONNECT_WALLET,
        );
    });

    it('renders nothing once the wallet disconnects, so no wallet-less state shows before the landing page', () => {
        const { container, rerender } = render(createTestComponent());

        useWalletConnectedSpy.mockReturnValue(false);
        rerender(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });

    it('disconnects on close and lands on the landing page once disconnected', async () => {
        const { rerender } = render(createTestComponent());

        const isNotPrevented = fireEvent.click(
            screen.getByRole('link', { name: 'close' }),
        );

        expect(isNotPrevented).toBe(false);
        await waitFor(() => expect(disconnectMock).toHaveBeenCalled());
        expect(replaceMock).not.toHaveBeenCalled();

        useWalletConnectedSpy.mockReturnValue(false);
        rerender(createTestComponent());

        expect(prefetchMock).toHaveBeenCalledWith('/');
        expect(replaceMock).toHaveBeenCalledTimes(1);
        expect(replaceMock).toHaveBeenCalledWith('/');
    });

    it('leaves for the landing page on close even when the disconnect fails', async () => {
        disconnectMock.mockRejectedValue(new Error('disconnect'));
        render(createTestComponent());

        await userEvent.click(screen.getByRole('link', { name: 'close' }));

        await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/'));
    });

    it('clears the selection when the wallet switches to another account', async () => {
        const { rerender } = render(createTestComponent());
        await userEvent.click(screen.getByText('pick one'));
        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: [first] }),
            undefined,
        );

        mockWalletAddress(otherWallet);
        rerender(createTestComponent());

        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: [] }),
            undefined,
        );
    });
});
