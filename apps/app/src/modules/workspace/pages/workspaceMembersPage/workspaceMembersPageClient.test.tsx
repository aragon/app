import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
    DaoMembersPageClient,
    type IDaoMembersPageClientProps,
} from '@/modules/governance/pages/daoMembersPage';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import {
    type IWorkspaceMembersPageClientProps,
    WorkspaceMembersPageClient,
} from './workspaceMembersPageClient';

// Only the DAO members page is replaced: it renders the account selector it is given, so the tests can drive it.
jest.mock('@/modules/governance/pages/daoMembersPage', () => ({
    DaoMembersPageClient: jest.fn((props: { children?: React.ReactNode }) => (
        <div data-testid="dao-members-page-mock">{props.children}</div>
    )),
}));

describe('<WorkspaceMembersPageClient /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const otherDaoAddress = '0x220866B1A2219f40e72f5c628B65D54268cA3A9D';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const daoMembersPageMock = DaoMembersPageClient as jest.Mock;

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
        metadata: { name: 'Grants Safe' },
    };

    const otherDaoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${otherDaoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: otherDaoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const demoDaoInfo: IWorkspaceAccountInfo = {
        network: Network.ETHEREUM_SEPOLIA,
        address: daoAddress,
        type: WorkspaceAccountInfoType.DAO,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: true,
        name: 'Demo DAO',
    };

    const otherDaoInfo: IWorkspaceAccountInfo = {
        ...demoDaoInfo,
        address: otherDaoAddress,
        name: 'Other DAO',
    };

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'test-workspace',
        name: 'Test Workspace',
        description: 'A test workspace',
        avatar: null,
        links: [],
        owner: daoAddress,
        accounts: [daoAccount, safeAccount],
        targets: [],
        ...workspace,
    });

    /**
     * Props of the last render of the DAO members page.
     */
    const lastDaoMembersPageProps = () =>
        daoMembersPageMock.mock.calls.at(-1)?.[0] as
            | IDaoMembersPageClientProps
            | undefined;

    /**
     * Opens the account dropdown, whose trigger is labelled by the option currently selected.
     */
    const openAccountFilter = async (activeLabel: string) =>
        await userEvent.click(
            await screen.findByRole('button', { name: activeLabel }),
        );

    const selectAccount = async (activeLabel: string, label: string) => {
        await openAccountFilter(activeLabel);
        await userEvent.click(await screen.findByText(label));
    };

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        getAccountsSpy.mockResolvedValue([demoDaoInfo]);
        getDaoSpy.mockResolvedValue(generateDao());
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        getDaoSpy.mockReset();
        daoMembersPageMock.mockClear();
        localStorage.clear();
    });

    let testIndex = 0;

    // The query client must sit inside the gov-ui-kit provider: that provider carries a query client of its own,
    // which would otherwise shadow this one and share its cache with every other test of this file.
    const createTestComponent = (
        props?: Partial<IWorkspaceMembersPageClientProps>,
    ) => {
        testIndex += 1;
        const completeProps: IWorkspaceMembersPageClientProps = {
            workspaceId: `test-workspace-${testIndex.toString()}`,
            pageSize: 18,
            featuredDelegates: [],
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient()}>
                    <WorkspaceMembersPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('offers the DAO accounts only, with no aggregated option', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({
                accounts: [daoAccount, otherDaoAccount, safeAccount],
            }),
        );
        getAccountsSpy.mockResolvedValue([demoDaoInfo, otherDaoInfo]);
        render(createTestComponent());

        await openAccountFilter('Demo DAO');

        expect(await screen.findByText('Other DAO')).toBeInTheDocument();
        // The Safe has no option: it has no governance bodies to read members from.
        expect(screen.queryByText('Grants Safe')).not.toBeInTheDocument();
        expect(
            screen.queryByText(addressUtils.truncateAddress(safeAddress)),
        ).not.toBeInTheDocument();
    });

    it('renders the DAO members page of the first DAO account by default', async () => {
        const featuredDelegates = [
            { daoAddress } as unknown as IFeaturedDelegates,
        ];
        render(createTestComponent({ featuredDelegates, pageSize: 12 }));

        await waitFor(() =>
            expect(lastDaoMembersPageProps()).toEqual(
                expect.objectContaining({
                    featuredDelegates,
                    initialParams: {
                        queryParams: { daoId: daoAccount.id, pageSize: 12 },
                    },
                }),
            ),
        );
        expect(screen.getByTestId('dao-members-page-mock')).toBeInTheDocument();
    });

    it('renders the DAO members page of the selected account', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount, otherDaoAccount] }),
        );
        getAccountsSpy.mockResolvedValue([demoDaoInfo, otherDaoInfo]);
        render(createTestComponent());

        await selectAccount('Demo DAO', 'Other DAO');

        await waitFor(() =>
            expect(
                lastDaoMembersPageProps()?.initialParams.queryParams.daoId,
            ).toEqual(otherDaoAccount.id),
        );
    });

    it('displays a loading list while the workspace is loading', () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        const { container } = render(createTestComponent());

        expect(
            container.querySelectorAll('[aria-busy="true"]').length,
        ).toBeGreaterThan(0);
        // The aside column is reserved so the skeleton cards match the width of the member cards.
        expect(container.querySelector('aside')).toBeInTheDocument();
        expect(daoMembersPageMock).not.toHaveBeenCalled();
    });

    it('displays a loading list below the account selector while the DAO of the account is loading', async () => {
        getDaoSpy.mockReturnValue(new Promise(() => undefined));
        // The selector only renders with more than one account to choose from.
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [daoAccount, otherDaoAccount] }),
        );
        getAccountsSpy.mockResolvedValue([demoDaoInfo, otherDaoInfo]);
        const { container } = render(createTestComponent());

        expect(
            await screen.findByRole('button', { name: 'Demo DAO' }),
        ).toBeInTheDocument();
        expect(
            container.querySelectorAll('[aria-busy="true"]').length,
        ).toBeGreaterThan(0);
        expect(daoMembersPageMock).not.toHaveBeenCalled();
    });

    it('reads the DAO of the selected account', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(getDaoSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    urlParams: { id: daoAccount.id },
                }),
            ),
        );
    });

    it('displays an empty state for a workspace without DAO accounts', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({ accounts: [safeAccount] }),
        );
        render(createTestComponent());

        expect(
            await screen.findByText(
                /workspaceMembersPage\.emptyState\.heading$/,
            ),
        ).toBeInTheDocument();
        expect(daoMembersPageMock).not.toHaveBeenCalled();
    });

    it('displays an empty state when the workspace does not exist', async () => {
        getWorkspaceSpy.mockRejectedValue(new Error('not found'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceMembersPage\.notFound\.title$/),
        ).toBeInTheDocument();
    });

    it('does not resolve account names for a workspace that has none', async () => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace({ accounts: [] }));
        render(createTestComponent());

        expect(
            await screen.findByText(
                /workspaceMembersPage\.emptyState\.heading$/,
            ),
        ).toBeInTheDocument();
        expect(getAccountsSpy).not.toHaveBeenCalled();
    });
});
