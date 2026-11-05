import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateReactQueryResultError,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
    generateSafeInfoResponse,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import * as useWorkspaceAccountOptionsHook from '../../hooks/useWorkspaceAccountOptions';
import {
    type IWorkspaceSafeSettingsPageClientProps,
    WorkspaceSafeSettingsPageClient,
} from './workspaceSafeSettingsPageClient';

describe('<WorkspaceSafeSettingsPageClient /> component', () => {
    const address = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsHook,
        'useWorkspaceAccountOptions',
    );

    const safeAccount: IWorkspaceAccount = {
        id: accountId,
        type: WorkspaceAccountType.SAFE,
        address,
        network: Network.ETHEREUM_SEPOLIA,
        metadata: { name: 'Grants Safe', description: 'Pays the grants' },
    };

    const mockActiveOption = (
        option?: Partial<useWorkspaceAccountOptionsHook.IWorkspaceAccountOption>,
    ) => {
        const activeOption: useWorkspaceAccountOptionsHook.IWorkspaceAccountOption =
            {
                id: accountId,
                label: 'Grants Safe',
                account: safeAccount,
                isAllAccounts: false,
                isExternal: false,
                ...option,
            };

        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [activeOption],
            accountId,
            activeOption,
            isAllAccounts: false,
            scopedAccounts: [safeAccount],
            isPending: false,
        });
    };

    beforeEach(() => {
        mockActiveOption();
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({
                    address,
                    owners: ['0x1111', '0x2222'],
                    threshold: 1,
                    nonce: '12',
                    version: '1.4.1',
                }),
            }),
        );
    });

    afterEach(() => {
        useSafeInfoSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceSafeSettingsPageClientProps>,
    ) => {
        const completeProps: IWorkspaceSafeSettingsPageClientProps = {
            workspaceId: 'demo',
            network: Network.ETHEREUM_SEPOLIA,
            address,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceSafeSettingsPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the account section with the blockchain, address and description of the Safe, as the DAO hierarchy states a DAO', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceSafeSettingsPage\.main\.accountTitle/),
        ).toBeInTheDocument();
        expect(screen.getByText('Ethereum Sepolia')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceSafeSettingsPage\.account\.address/),
        ).toBeInTheDocument();
        expect(screen.getByText('Pays the grants')).toBeInTheDocument();
        // The DAO hierarchy names no account in the section, so neither does the Safe.
        expect(
            screen.queryByText(/workspaceSafeSettingsPage\.account\.name/),
        ).not.toBeInTheDocument();
    });

    it('links the address of the Safe to the Safe app and states it as not changeable', () => {
        render(createTestComponent());

        const [, addressNotChangeable] = screen.getAllByText(
            /workspaceSafeSettingsPage\.account\.notChangeable/,
        );
        expect(addressNotChangeable).toBeInTheDocument();
        const [addressLink] = screen.getAllByRole('link', {
            name: /0x1F01…132a/,
        });
        expect(addressLink).toHaveAttribute(
            'href',
            expect.stringContaining(`sep:${address}`),
        );
    });

    it('states the blockchain of the Safe as not changeable under its name, as the DAO hierarchy does', () => {
        render(createTestComponent());

        const term = screen.getByText(
            /workspaceSafeSettingsPage\.account\.blockchain/,
        );
        const [notChangeable] = screen.getAllByText(
            /workspaceSafeSettingsPage\.account\.notChangeable/,
        );
        expect(term).toBeInTheDocument();
        expect(notChangeable.previousElementSibling).toHaveTextContent(
            'Ethereum Sepolia',
        );
    });

    it('leaves the summary out for an account with no description', () => {
        mockActiveOption({
            account: { ...safeAccount, metadata: { name: 'Grants Safe' } },
        });
        render(createTestComponent());

        expect(
            screen.queryByText(/workspaceSafeSettingsPage\.account\.summary/),
        ).not.toBeInTheDocument();
    });

    it('renders the blockchain and address of the Safe while no option resolves the account', () => {
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [],
            accountId,
            activeOption: undefined,
            isAllAccounts: false,
            scopedAccounts: [],
            isPending: true,
        });
        render(createTestComponent());

        expect(screen.getByText('Ethereum Sepolia')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceSafeSettingsPage\.account\.address/),
        ).toBeInTheDocument();
    });

    it('renders the governance of the Safe, linking the threshold to its members', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                /workspaceSafeSettingsPage\.main\.governanceTitle/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/safeSettings\.thresholdOfOwners/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/safeSettings\.currentNonce/),
        ).toBeInTheDocument();
        expect(
            screen
                .getAllByRole('link')
                .some(
                    (link) =>
                        link.getAttribute('href') ===
                        `/workspace/demo/${accountId}/members`,
                ),
        ).toBeTruthy();
    });

    it('opens the members page from the threshold in the same tab, as an in-app link', () => {
        render(createTestComponent());

        const membersLink = screen
            .getAllByRole('link')
            .find(
                (link) =>
                    link.getAttribute('href') ===
                    `/workspace/demo/${accountId}/members`,
            );
        expect(membersLink).toBeDefined();
        expect(membersLink).not.toHaveAttribute('target');
    });

    it('lists a contract that is both the guard and a module of the Safe once per role', () => {
        const contract = '0x3333333333333333333333333333333333333333';
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({
                    address,
                    guard: contract,
                    modules: [contract],
                }),
            }),
        );
        render(createTestComponent());

        const duplicateKeyErrors = consoleErrorSpy.mock.calls.filter((call) =>
            call.some(
                (argument) =>
                    typeof argument === 'string' &&
                    argument.includes('same key'),
            ),
        );
        expect(duplicateKeyErrors).toHaveLength(0);
        // Disclosed once in governance and once in the contracts as the guard, then once more as a module.
        expect(screen.getAllByText(/safeSettings\.guard$/)).toHaveLength(2);
        expect(
            screen.getAllByText(/safeSettings\.(module|moduleNames)/).length,
        ).toBeGreaterThan(0);

        consoleErrorSpy.mockRestore();
    });

    it('renders the guard and modules of the Safe when it has any', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({
                    address,
                    guard: '0x3333333333333333333333333333333333333333',
                    modules: ['0x4444444444444444444444444444444444444444'],
                }),
            }),
        );
        render(createTestComponent());

        // The guard is disclosed in governance and listed again among the contracts, linked in both.
        expect(screen.getAllByText(/safeSettings\.guard$/)).toHaveLength(2);
        expect(
            screen
                .getAllByRole('link')
                .filter((link) =>
                    link
                        .getAttribute('href')
                        ?.endsWith(
                            '/address/0x3333333333333333333333333333333333333333',
                        ),
                ),
        ).toHaveLength(2);
        expect(screen.getByText(/safeSettings\.modules$/)).toBeInTheDocument();
    });

    it('renders no governance rows while the Safe is read', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeServiceApi.useSafeInfo
            >,
        );
        render(createTestComponent());

        expect(
            screen.queryByText(/safeSettings\.threshold$/),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                /workspaceSafeSettingsPage\.governance\.unavailable/,
            ),
        ).not.toBeInTheDocument();
    });

    it('says the configuration cannot be read when the Safe read fails', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultError({
                error: new Error('fail'),
            }) as ReturnType<typeof safeServiceApi.useSafeInfo>,
        );
        render(createTestComponent());

        expect(
            screen.getByText(
                /workspaceSafeSettingsPage\.governance\.unavailable/,
            ),
        ).toBeInTheDocument();
        expect(screen.getByText(/safeSettings\.safe$/)).toBeInTheDocument();
    });

    it('renders the Safe address with its version in the contracts aside', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                /workspaceSafeSettingsPage\.aside\.contractsTitle/,
            ),
        ).toBeInTheDocument();
        expect(screen.getByText(/safeSettings\.safe$/)).toBeInTheDocument();
        expect(
            screen.getByText(/safeSettings\.versionHelp/),
        ).toBeInTheDocument();
    });

    it('lists the enabled modules in the contracts aside, named when they are official deployments', () => {
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSafeInfoResponse({
                    address,
                    modules: [
                        '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134',
                        '0x4444444444444444444444444444444444444444',
                    ],
                }),
            }),
        );
        render(createTestComponent());

        expect(
            screen.getByText(/safeSettings\.moduleNames\.allowance/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/safeSettings\.unknownModule/),
        ).toBeInTheDocument();
        expect(screen.getByText('0x4444…4444')).toBeInTheDocument();
    });
});
