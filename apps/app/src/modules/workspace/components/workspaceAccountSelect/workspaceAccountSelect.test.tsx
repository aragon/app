import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    WorkspaceAccountSuggestionRole,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import * as useWorkspaceAccountLookupModule from '../../hooks/useWorkspaceAccountLookup';
import * as useWorkspaceAccountSuggestionsModule from '../../hooks/useWorkspaceAccountSuggestions';
import * as useWorkspaceDaosModule from '../../hooks/useWorkspaceDaos';
import {
    type IWorkspaceAccountSelectProps,
    WorkspaceAccountSelect,
} from './workspaceAccountSelect';

describe('<WorkspaceAccountSelect /> component', () => {
    const wallet = '0x5dcD623bf6E792bfBDbf8d643f6478153df4A8D2';

    const buildAccount = (
        network: Network,
        address: string,
        type = WorkspaceAccountType.DAO,
    ): IWorkspaceAccount => ({
        id: `${network}-${address}`,
        type,
        address,
        network,
    });

    const created = buildAccount(
        Network.ETHEREUM_MAINNET,
        '0x23A16064466201bfB2b096B68c5103B70Da78394',
    );
    const member = buildAccount(
        Network.ETHEREUM_MAINNET,
        '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
    );
    const lookedUp = buildAccount(
        Network.BASE_MAINNET,
        '0x1F01e6fe406295c9fe42189A2ef999636a04132a',
        WorkspaceAccountType.SAFE,
    );

    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const useSuggestionsSpy = jest.spyOn(
        useWorkspaceAccountSuggestionsModule,
        'useWorkspaceAccountSuggestions',
    );
    const useWorkspaceDaosSpy = jest.spyOn(
        useWorkspaceDaosModule,
        'useWorkspaceDaos',
    );
    const useLookupSpy = jest.spyOn(
        useWorkspaceAccountLookupModule,
        'useWorkspaceAccountLookup',
    );

    beforeEach(() => {
        useWorkspaceDaosSpy.mockReturnValue({ daos: {}, isPending: false });
        useWalletAccountSpy.mockReturnValue({
            address: wallet,
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);
        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: false,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions: [
                {
                    account: created,
                    dao: generateDao({ name: 'Created DAO' }),
                    role: WorkspaceAccountSuggestionRole.CREATOR,
                },
                {
                    account: member,
                    dao: generateDao({ name: 'Member DAO' }),
                    role: WorkspaceAccountSuggestionRole.MEMBER,
                },
            ],
        });
        useLookupSpy.mockReturnValue({
            results: [],
            isLoading: false,
            isNotFound: false,
            isError: false,
        });
    });

    afterEach(() => {
        useWorkspaceDaosSpy.mockReset();
        useWalletAccountSpy.mockReset();
        useSuggestionsSpy.mockReset();
        useLookupSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAccountSelectProps>,
    ) => {
        const completeProps: IWorkspaceAccountSelectProps = {
            value: [],
            onChange: jest.fn(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAccountSelect {...completeProps} />
            </GukModulesProvider>
        );
    };

    const getCheckbox = (name: RegExp) =>
        screen.getByRole('checkbox', { name });

    it('offers to add an account by address when there are no suggestions', async () => {
        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: false,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions: [],
        });
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.emptyState.noAccounts',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.emptyState.description',
            ),
        ).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceAccountSelect.emptyState.addByAddress',
            }),
        );
        expect(
            screen.getByPlaceholderText(
                'app.workspace.workspaceAccountSelect.addressView.placeholder',
            ),
        ).toBeInTheDocument();
    });

    it('opens on the address view when initialMode is address', () => {
        render(createTestComponent({ initialMode: 'address' }));

        expect(
            screen.getByPlaceholderText(
                'app.workspace.workspaceAccountSelect.addressView.placeholder',
            ),
        ).toBeInTheDocument();
    });

    it('suggests the accounts of the connected wallet, deployed ones first', () => {
        render(createTestComponent());

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toHaveAccessibleName(/Created DAO/);
        expect(checkboxes[1]).toHaveAccessibleName(/Member DAO/);
        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.note.member',
            ),
        ).toBeInTheDocument();
        expect(useSuggestionsSpy).toHaveBeenCalledWith(wallet);
    });

    it('selects and deselects accounts', async () => {
        const onChange = jest.fn();
        const { rerender } = render(createTestComponent({ onChange }));

        await userEvent.click(getCheckbox(/Member DAO/));
        expect(onChange).toHaveBeenLastCalledWith([member]);

        rerender(createTestComponent({ onChange, value: [member] }));
        expect(getCheckbox(/Member DAO/)).toBeChecked();

        await userEvent.click(getCheckbox(/Member DAO/));
        expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it('locks a suggested account the workspace holds and lists it last', () => {
        render(createTestComponent({ workspaceAccounts: [created] }));

        const checkbox = getCheckbox(/Created DAO/);
        expect(checkbox).toBeChecked();
        expect(checkbox).toBeDisabled();
        expect(screen.getAllByRole('checkbox').at(-1)).toBe(checkbox);
        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.note.inWorkspace',
            ),
        ).toBeInTheDocument();
    });

    it('filters the accounts by name', async () => {
        render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), 'member');

        expect(getCheckbox(/Member DAO/)).toBeInTheDocument();
        expect(
            screen.queryByRole('checkbox', { name: /Created DAO/ }),
        ).not.toBeInTheDocument();
    });

    it('adds an account found by address to the selection and the list', async () => {
        useLookupSpy.mockReturnValue({
            results: [
                {
                    account: lookedUp,
                    accountInfo: {
                        network: lookedUp.network,
                        address: lookedUp.address,
                        type: WorkspaceAccountInfoType.SAFE,
                        status: WorkspaceAccountInfoStatus.AVAILABLE,
                        indexed: true,
                    },
                },
            ],
            isLoading: false,
            isNotFound: false,
            isError: false,
        });
        const onChange = jest.fn();
        render(createTestComponent({ onChange }));

        await userEvent.type(screen.getByRole('searchbox'), lookedUp.address);
        await userEvent.click(screen.getByRole('checkbox'));

        expect(onChange).toHaveBeenLastCalledWith([lookedUp]);
        expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });

    it('tells when an address is not an account on any network', async () => {
        useLookupSpy.mockReturnValue({
            results: [],
            isLoading: false,
            isNotFound: true,
            isError: false,
        });
        render(createTestComponent());

        await userEvent.type(
            screen.getByRole('searchbox'),
            '0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf',
        );

        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.addressView.notFound.heading',
            ),
        ).toBeInTheDocument();
    });

    it('shows a looked-up account the workspace holds as checked and not selectable', async () => {
        useLookupSpy.mockReturnValue({
            results: [
                {
                    account: lookedUp,
                    accountInfo: {
                        network: lookedUp.network,
                        address: lookedUp.address,
                        type: WorkspaceAccountInfoType.SAFE,
                        status: WorkspaceAccountInfoStatus.AVAILABLE,
                        indexed: true,
                    },
                },
            ],
            isLoading: false,
            isNotFound: false,
            isError: false,
        });
        render(createTestComponent({ workspaceAccounts: [lookedUp] }));

        await userEvent.type(screen.getByRole('searchbox'), lookedUp.address);

        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('looks up an ENS name typed with capitals', async () => {
        render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), 'Vitalik.ETH');

        expect(useLookupSpy).toHaveBeenLastCalledWith('Vitalik.ETH');
        expect(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceAccountSelect.addressView.back',
            }),
        ).toBeInTheDocument();
    });

    it('lists the suggestions found so far while the scan runs', () => {
        useSuggestionsSpy.mockReturnValue({
            isPending: true,
            isError: false,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions: [
                {
                    account: member,
                    dao: generateDao({ name: 'Member DAO' }),
                    role: WorkspaceAccountSuggestionRole.MEMBER,
                },
            ],
        });
        render(createTestComponent());

        expect(getCheckbox(/Member DAO/)).toBeInTheDocument();
    });

    it('shows the suggestions a page at a time', async () => {
        const suggestions = Array.from({ length: 13 }, (_, index) => ({
            account: buildAccount(
                Network.ETHEREUM_MAINNET,
                `0x${(index + 1).toString(16).padStart(40, '0')}`,
            ),
            dao: generateDao({ name: `DAO ${index.toString()}` }),
            role: WorkspaceAccountSuggestionRole.MEMBER,
        }));
        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: false,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions,
        });
        render(createTestComponent());

        expect(screen.getAllByRole('checkbox')).toHaveLength(12);

        await userEvent.click(screen.getByRole('button', { name: /more/i }));

        expect(screen.getAllByRole('checkbox')).toHaveLength(13);
    });

    it('keeps a selected account listed when the suggestions no longer hold it', async () => {
        const onChange = jest.fn();
        render(createTestComponent({ onChange, value: [lookedUp] }));

        const selected = screen.getAllByRole('checkbox')[0];
        expect(selected).toHaveAccessibleName(/0x1F01/);
        expect(selected).toBeChecked();

        await userEvent.click(selected);
        expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it('keeps the name and note of a selected suggestion the suggestions drop', () => {
        const { rerender } = render(createTestComponent({ value: [member] }));

        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: false,
            isIncomplete: true,
            refetch: jest.fn(),
            suggestions: [],
        });
        rerender(createTestComponent({ value: [member] }));

        expect(getCheckbox(/Member DAO/)).toBeChecked();
        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.note.member',
            ),
        ).toBeInTheDocument();
    });

    it('keeps the latest name and note of a selected suggestion the suggestions drop', () => {
        const { rerender } = render(createTestComponent({ value: [member] }));

        const mockSuggestions = (
            suggestions: ReturnType<
                typeof useWorkspaceAccountSuggestionsModule.useWorkspaceAccountSuggestions
            >['suggestions'],
        ) =>
            useSuggestionsSpy.mockReturnValue({
                isPending: false,
                isError: false,
                isIncomplete: true,
                refetch: jest.fn(),
                suggestions,
            });
        mockSuggestions([
            {
                account: member,
                dao: generateDao({ name: 'Renamed DAO' }),
                role: WorkspaceAccountSuggestionRole.CREATOR,
            },
        ]);
        rerender(createTestComponent({ value: [member] }));
        mockSuggestions([]);
        rerender(createTestComponent({ value: [member] }));

        expect(getCheckbox(/Renamed DAO/)).toBeChecked();
        expect(
            screen.queryByText(
                'app.workspace.workspaceAccountSelect.note.member',
            ),
        ).not.toBeInTheDocument();
    });

    it('lists the accounts the workspace holds even when nothing suggests them', () => {
        render(createTestComponent({ workspaceAccounts: [lookedUp] }));

        const checkboxes = screen.getAllByRole('checkbox');
        const held = checkboxes.at(-1);
        expect(checkboxes).toHaveLength(3);
        expect(held).toBeChecked();
        expect(held).toBeDisabled();
        expect(held).toHaveAccessibleName(/0x1F01/);
    });

    it('labels only the accounts the wallet is a member of, not the ones it deployed', () => {
        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: false,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions: [
                {
                    account: lookedUp,
                    role: WorkspaceAccountSuggestionRole.CREATOR,
                },
                {
                    account: member,
                    dao: generateDao({ name: 'Member DAO' }),
                    role: WorkspaceAccountSuggestionRole.MEMBER,
                },
            ],
        });
        render(createTestComponent());

        expect(
            screen.getAllByText(
                'app.workspace.workspaceAccountSelect.note.member',
            ),
        ).toHaveLength(1);
    });

    it('lists the accounts the workspace holds after the others, whatever their rank', () => {
        const testnetMember = buildAccount(
            Network.ETHEREUM_SEPOLIA,
            '0x8a0DBF8Cf5110f9C2e6Cec75fc7b745A4b133a18',
        );
        const heldMainnet = buildAccount(
            Network.BASE_MAINNET,
            '0xb4e9c401836E29a6D348168e741A4550277B60d0',
            WorkspaceAccountType.SAFE,
        );
        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: false,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions: [
                {
                    account: testnetMember,
                    dao: generateDao({ name: 'Testnet DAO' }),
                    role: WorkspaceAccountSuggestionRole.MEMBER,
                },
            ],
        });
        render(createTestComponent({ workspaceAccounts: [heldMainnet] }));

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toHaveAccessibleName(/Testnet DAO/);
        expect(checkboxes[1]).toHaveAccessibleName(/0xb4e9/);
    });

    it('shows placeholder rows while an address is looked up', async () => {
        useLookupSpy.mockReturnValue({
            results: [],
            isLoading: true,
            isNotFound: false,
            isError: false,
        });
        render(createTestComponent());

        await userEvent.type(
            screen.getByRole('searchbox'),
            '0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf',
        );

        expect(
            screen.getAllByTestId('stateSkeletonBar').length,
        ).toBeGreaterThan(0);
    });

    it('tells when an address could not be looked up', async () => {
        useLookupSpy.mockReturnValue({
            results: [],
            isLoading: false,
            isNotFound: false,
            isError: true,
        });
        render(createTestComponent());

        await userEvent.type(
            screen.getByRole('searchbox'),
            '0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf',
        );

        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.addressView.error.heading',
            ),
        ).toBeInTheDocument();
    });

    it('shows an account the list already holds as in the list, and selects it on click', async () => {
        const onChange = jest.fn();
        useLookupSpy.mockReturnValue({
            results: [
                {
                    account: member,
                    accountInfo: {
                        network: member.network,
                        address: member.address,
                        type: WorkspaceAccountInfoType.DAO,
                        status: WorkspaceAccountInfoStatus.AVAILABLE,
                        indexed: true,
                    },
                },
            ],
            isLoading: false,
            isNotFound: false,
            isError: false,
        });
        render(createTestComponent({ onChange }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceAccountSelect.addAddress',
            }),
        );
        await userEvent.type(screen.getByRole('searchbox'), member.address);

        const row = await screen.findByRole('button', {
            name: /app.workspace.workspaceAccountSelect.note.inList/,
        });
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        await userEvent.click(row);
        expect(onChange).toHaveBeenCalledWith([member]);
    });

    it('reads the DAO of a DAO found by address, for its avatar', async () => {
        useLookupSpy.mockReturnValue({
            results: [
                {
                    account: lookedUp,
                    accountInfo: {
                        network: lookedUp.network,
                        address: lookedUp.address,
                        type: WorkspaceAccountInfoType.DAO,
                        status: WorkspaceAccountInfoStatus.AVAILABLE,
                        indexed: true,
                        name: 'Indexed name',
                    },
                },
            ],
            isLoading: false,
            isNotFound: false,
            isError: false,
        });
        useWorkspaceDaosSpy.mockImplementation((accounts = []) => ({
            daos: accounts.some(({ id }) => id === lookedUp.id)
                ? { [lookedUp.id]: generateDao({ name: 'Found DAO' }) }
                : {},
            isPending: false,
        }));
        render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), lookedUp.address);

        expect(getCheckbox(/Found DAO/)).toBeInTheDocument();
    });

    it('looks an address up only once the list is complete', async () => {
        useSuggestionsSpy.mockReturnValue({
            isPending: true,
            isError: false,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions: [
                {
                    account: created,
                    role: WorkspaceAccountSuggestionRole.CREATOR,
                },
            ],
        });
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceAccountSelect.addAddress',
            }),
        );
        await userEvent.type(screen.getByRole('searchbox'), member.address);

        expect(useLookupSpy).toHaveBeenLastCalledWith(undefined);
        expect(
            screen.getAllByTestId('stateSkeletonBar').length,
        ).toBeGreaterThan(0);
    });

    it('matches accounts on network and address whatever their casing', () => {
        const heldLowercase: IWorkspaceAccount = {
            ...created,
            id: created.id.toLowerCase(),
            address: created.address.toLowerCase(),
        };
        render(createTestComponent({ workspaceAccounts: [heldLowercase] }));

        const checkbox = getCheckbox(/Created DAO/);
        expect(checkbox).toBeChecked();
        expect(checkbox).toBeDisabled();
        expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    });

    it('looks up what is typed in the address view once typing pauses', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceAccountSelect.addAddress',
            }),
        );
        await userEvent.type(screen.getByRole('searchbox'), lookedUp.address);

        await waitFor(() =>
            expect(useLookupSpy).toHaveBeenLastCalledWith(lookedUp.address),
        );
        expect(useLookupSpy).not.toHaveBeenCalledWith(
            lookedUp.address.slice(0, -1),
        );
    });

    it('clears the address view at once when its value is no longer an address', async () => {
        useLookupSpy.mockImplementation((value) => ({
            results: [],
            isLoading: false,
            isNotFound: value != null,
            isError: false,
        }));
        render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), lookedUp.address);
        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.addressView.notFound.heading',
            ),
        ).toBeInTheDocument();

        await userEvent.type(screen.getByRole('searchbox'), '{backspace}');

        expect(
            screen.queryByText(
                'app.workspace.workspaceAccountSelect.addressView.notFound.heading',
            ),
        ).not.toBeInTheDocument();
        expect(screen.queryAllByTestId('stateSkeletonBar')).toHaveLength(0);
    });

    it('offers to add an account by address when the suggestions could not be loaded', () => {
        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: true,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions: [],
        });
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.workspace.workspaceAccountSelect.emptyState.noAccounts',
            ),
        ).toBeInTheDocument();
    });

    it('keeps an account added by address listed when the suggestions could not be loaded', async () => {
        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: true,
            isIncomplete: false,
            refetch: jest.fn(),
            suggestions: [],
        });
        useLookupSpy.mockReturnValue({
            results: [
                {
                    account: lookedUp,
                    accountInfo: {
                        network: lookedUp.network,
                        address: lookedUp.address,
                        type: WorkspaceAccountInfoType.SAFE,
                        status: WorkspaceAccountInfoStatus.AVAILABLE,
                        indexed: true,
                    },
                },
            ],
            isLoading: false,
            isNotFound: false,
            isError: false,
        });
        const { rerender } = render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), lookedUp.address);
        await userEvent.click(screen.getByRole('checkbox'));
        rerender(createTestComponent({ value: [lookedUp] }));

        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('keeps listing the suggestions it holds when reading them again fails', () => {
        useSuggestionsSpy.mockReturnValue({
            ...useSuggestionsSpy.getMockImplementation()?.(undefined),
            isError: true,
        } as ReturnType<
            typeof useWorkspaceAccountSuggestionsModule.useWorkspaceAccountSuggestions
        >);
        render(createTestComponent({ value: [member] }));

        expect(getCheckbox(/Created DAO/)).toBeInTheDocument();
        expect(getCheckbox(/Member DAO/)).toBeChecked();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
