import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import * as workspaceAccountSelectModule from '../../components/workspaceAccountSelect';
import * as useWorkspaceAccountSuggestionsModule from '../../hooks/useWorkspaceAccountSuggestions';
import * as useWorkspaceCreateAccountDialogModule from '../../hooks/useWorkspaceCreateAccountDialog';
import {
    type IWorkspaceAddAccountsDialogProps,
    WorkspaceAddAccountsDialog,
} from './workspaceAddAccountsDialog';

describe('<WorkspaceAddAccountsDialog /> component', () => {
    const buildAccount = (address: string): IWorkspaceAccount => ({
        id: `${Network.ETHEREUM_MAINNET}-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_MAINNET,
    });

    const held = buildAccount('0x23A16064466201bfB2b096B68c5103B70Da78394');
    const first = buildAccount('0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5');
    const second = buildAccount('0x1F01e6fe406295c9fe42189A2ef999636a04132a');

    const closeSpy = jest.fn();
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const mockWallet = (address?: string) =>
        useWalletAccountSpy.mockReturnValue({
            address,
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const addWorkspaceAccountSpy = jest.spyOn(
        workspaceService,
        'addWorkspaceAccount',
    );
    const selectSpy = jest.spyOn(
        workspaceAccountSelectModule,
        'WorkspaceAccountSelect',
    );
    const useSuggestionsSpy = jest.spyOn(
        useWorkspaceAccountSuggestionsModule,
        'useWorkspaceAccountSuggestions',
    );
    const useCreateAccountDialogSpy = jest.spyOn(
        useWorkspaceCreateAccountDialogModule,
        'useWorkspaceCreateAccountDialog',
    );
    const openCreateAccountMock = jest.fn();
    const mockIncomplete = (isIncomplete: boolean) =>
        useSuggestionsSpy.mockReturnValue({
            suggestions: [],
            isPending: false,
            isError: false,
            isIncomplete,
            refetch: jest.fn(),
        });

    let workspace: IWorkspace;

    beforeEach(async () => {
        mockWallet('0x5dcD623bf6E792bfBDbf8d643f6478153df4A8D2');
        mockIncomplete(false);
        useCreateAccountDialogSpy.mockReturnValue(openCreateAccountMock);
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ close: closeSpy }),
        );
        // Stands in for the selector: one button per selection it can report.
        selectSpy.mockImplementation(({ onChange }) => (
            <div>
                <button onClick={() => onChange([first])} type="button">
                    pick one
                </button>
                <button onClick={() => onChange([first, second])} type="button">
                    pick two
                </button>
            </div>
        ));
        workspace = await workspaceService.createWorkspace({
            body: {
                name: 'Demo',
                description: '',
                avatar: null,
                links: [],
                accounts: [held],
                targets: [],
            },
        });
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
        addWorkspaceAccountSpy.mockClear();
        selectSpy.mockReset();
        useSuggestionsSpy.mockReset();
        useCreateAccountDialogSpy.mockReset();
        openCreateAccountMock.mockReset();
        closeSpy.mockClear();
        localStorage.clear();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAddAccountsDialogProps>,
    ) => {
        const completeProps: IWorkspaceAddAccountsDialogProps = {
            location: {
                id: 'WORKSPACE_ADD_ACCOUNTS',
                params: { workspaceId: workspace.id },
            },
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <Dialog.Root open={true}>
                        <WorkspaceAddAccountsDialog {...completeProps} />
                    </Dialog.Root>
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    const getAddButton = () =>
        screen.getByRole('button', {
            name: /workspaceAddAccountsDialog.action.add/,
        });

    it('locks the accounts the workspace already holds', async () => {
        render(createTestComponent());

        await screen.findByText('pick one');

        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ workspaceAccounts: [held] }),
            undefined,
        );
    });

    it('disables adding until an account is picked', async () => {
        render(createTestComponent());
        await screen.findByText('pick one');

        expect(getAddButton()).toBeDisabled();
        expect(getAddButton()).toHaveTextContent(
            'app.workspace.workspaceAddAccountsDialog.action.add',
        );
    });

    it('counts the picked accounts on the add button', async () => {
        render(createTestComponent());

        await userEvent.click(await screen.findByText('pick one'));
        expect(getAddButton()).toHaveTextContent(
            'app.workspace.workspaceAddAccountsDialog.action.addOne',
        );

        await userEvent.click(screen.getByText('pick two'));
        expect(getAddButton()).toHaveTextContent(
            'app.workspace.workspaceAddAccountsDialog.action.addMany (count=2)',
        );
    });

    it('adds every picked account to the workspace and closes', async () => {
        render(createTestComponent());

        await userEvent.click(await screen.findByText('pick two'));
        await userEvent.click(getAddButton());

        await waitFor(() =>
            expect(closeSpy).toHaveBeenCalledWith('WORKSPACE_ADD_ACCOUNTS'),
        );
        await expect(
            workspaceService.getWorkspace({ urlParams: { id: workspace.id } }),
        ).resolves.toMatchObject({ accounts: [held, first, second] });
    });

    it('shows an error and stays open when the accounts cannot be added', async () => {
        addWorkspaceAccountSpy.mockRejectedValueOnce(new Error('storage'));
        render(createTestComponent());

        await userEvent.click(await screen.findByText('pick one'));
        await userEvent.click(getAddButton());

        expect(
            await screen.findByText(
                'app.workspace.workspaceAddAccountsDialog.error',
            ),
        ).toBeInTheDocument();
        expect(closeSpy).not.toHaveBeenCalled();
    });

    it('keeps only the accounts not added yet selected after a partial failure', async () => {
        addWorkspaceAccountSpy
            .mockResolvedValueOnce(workspace)
            .mockRejectedValueOnce(new Error('storage'));
        render(createTestComponent());

        await userEvent.click(await screen.findByText('pick two'));
        await userEvent.click(getAddButton());

        await screen.findByText(
            'app.workspace.workspaceAddAccountsDialog.error',
        );
        expect(getAddButton()).toHaveTextContent(
            'app.workspace.workspaceAddAccountsDialog.action.addOne',
        );
        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: [second] }),
            undefined,
        );
    });

    it('clears the selection when the wallet changes', async () => {
        const { rerender } = render(createTestComponent());
        await userEvent.click(await screen.findByText('pick one'));

        mockWallet('0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf');
        rerender(createTestComponent());

        await waitFor(() => expect(getAddButton()).toBeDisabled());
    });

    it('warns above the selector when accounts could not be loaded', async () => {
        mockIncomplete(true);
        render(createTestComponent());

        expect(
            await screen.findByText(
                'app.workspace.workspaceAccountSelect.incomplete',
            ),
        ).toBeInTheDocument();
    });

    it('creates an account on top of this dialog and adds it to the selection', async () => {
        const created = buildAccount(
            '0x9cE7B2b1F8a1A7d2dF0E43a4f7C2B1a3E5d6C7b8',
        );
        render(createTestComponent());

        await userEvent.click(await screen.findByText('pick one'));
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceAddAccountsDialog.action.createAccount',
            }),
        );

        expect(openCreateAccountMock).toHaveBeenCalledWith(
            { onCreated: expect.any(Function) },
            { stack: true },
        );
        const [{ onCreated }] = openCreateAccountMock.mock.calls[0];
        act(() => onCreated(created));

        expect(selectSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: [first, created] }),
            undefined,
        );
        expect(closeSpy).not.toHaveBeenCalled();
    });
});
