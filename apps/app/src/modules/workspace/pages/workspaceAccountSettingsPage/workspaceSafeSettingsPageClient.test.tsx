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

    it('renders the account section with the name, chain, Safe and description of the account', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceSafeSettingsPage\.main\.accountTitle/),
        ).toBeInTheDocument();
        expect(screen.getByText('Grants Safe')).toBeInTheDocument();
        expect(screen.getByText('Ethereum Sepolia')).toBeInTheDocument();
        expect(screen.getByText('Pays the grants')).toBeInTheDocument();
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

    it('labels the account by its truncated address while no option resolves it', () => {
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [],
            accountId,
            activeOption: undefined,
            isAllAccounts: false,
            scopedAccounts: [],
            isPending: true,
        });
        render(createTestComponent());

        expect(screen.getAllByText('0x1F01…132a').length).toBeGreaterThan(0);
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

        expect(screen.getByText(/safeSettings\.guard$/)).toBeInTheDocument();
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
});
