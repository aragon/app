import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import * as workspaceAccountSelectorProvider from '../../components/workspaceAccountSelectorProvider';
import {
    type IWorkspaceDetailsPageClientProps,
    WorkspaceDetailsPageClient,
} from './workspaceDetailsPageClient';
import {
    type IWorkspaceDetailsPageDaoDashboardProps,
    WorkspaceDetailsPageDaoDashboard,
} from './workspaceDetailsPageDaoDashboard';
import { WorkspaceDetailsPageOverview } from './workspaceDetailsPageOverview';

jest.mock('./workspaceDetailsPageDaoDashboard', () => ({
    WorkspaceDetailsPageDaoDashboard: jest.fn(() => (
        <div data-testid="account-dashboard-mock" />
    )),
}));

jest.mock('./workspaceDetailsPageOverview', () => ({
    WorkspaceDetailsPageOverview: jest.fn(() => (
        <div data-testid="overview-mock" />
    )),
}));

describe('<WorkspaceDetailsPageClient /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const useWorkspaceAccountSelectorContextSpy = jest.spyOn(
        workspaceAccountSelectorProvider,
        'useWorkspaceAccountSelectorContext',
    );
    const accountDashboardMock = WorkspaceDetailsPageDaoDashboard as jest.Mock;
    const overviewMock = WorkspaceDetailsPageOverview as jest.Mock;

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const allAccountsOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        { id: 'all', label: 'All accounts', isAllAccounts: true };

    const daoOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        {
            id: daoAccount.id,
            label: 'Demo DAO',
            account: daoAccount,
            isAllAccounts: false,
        };

    /**
     * Mocks the account selector context, every account being aggregated unless set otherwise.
     */
    const mockAccountSelector = (
        context?: Partial<workspaceAccountSelectorProvider.IWorkspaceAccountSelectorContext>,
    ) =>
        useWorkspaceAccountSelectorContextSpy.mockReturnValue({
            activeOption: allAccountsOption,
            setActiveOption: jest.fn(),
            options: [allAccountsOption, daoOption],
            ...context,
        });

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'test-workspace',
        name: 'Test Workspace',
        description: 'A test workspace',
        avatar: null,
        links: [],
        owner: address,
        accounts: [daoAccount],
        targets: [],
        ...workspace,
    });

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        mockAccountSelector();
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        useWorkspaceAccountSelectorContextSpy.mockReset();
        accountDashboardMock.mockClear();
        overviewMock.mockClear();
        localStorage.clear();
    });

    let testIndex = 0;

    const createTestComponent = (
        props?: Partial<IWorkspaceDetailsPageClientProps>,
    ) => {
        testIndex += 1;
        const completeProps: IWorkspaceDetailsPageClientProps = {
            workspaceId: `test-workspace-${testIndex.toString()}`,
            featuredDelegates: [],
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

    it('displays a loading state while the workspace loads', async () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        expect(await screen.findByRole('progressbar')).toBeInTheDocument();
        expect(overviewMock).not.toHaveBeenCalled();
        expect(accountDashboardMock).not.toHaveBeenCalled();
    });

    it('displays an empty state when the workspace does not exist', async () => {
        getWorkspaceSpy.mockRejectedValue(new Error('not found'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceDetailsPage\.notFound\.title$/),
        ).toBeInTheDocument();
        expect(overviewMock).not.toHaveBeenCalled();
    });

    it('displays the workspace overview when every account is aggregated', async () => {
        const workspace = buildWorkspace();
        getWorkspaceSpy.mockResolvedValue(workspace);
        render(createTestComponent());

        expect(await screen.findByTestId('overview-mock')).toBeInTheDocument();
        expect(overviewMock).toHaveBeenCalledWith(
            expect.objectContaining({ workspace }),
            undefined,
        );
        expect(accountDashboardMock).not.toHaveBeenCalled();
    });

    it('displays the dashboard of the selected account', async () => {
        const featuredDelegates = [
            { daoAddress: address } as unknown as IFeaturedDelegates,
        ];
        mockAccountSelector({ activeOption: daoOption });
        render(createTestComponent({ featuredDelegates }));

        expect(
            await screen.findByTestId('account-dashboard-mock'),
        ).toBeInTheDocument();
        expect(
            accountDashboardMock.mock.calls.at(-1)?.[0] as
                | IWorkspaceDetailsPageDaoDashboardProps
                | undefined,
        ).toEqual(
            expect.objectContaining({
                account: daoAccount,
                featuredDelegates,
            }),
        );
        expect(overviewMock).not.toHaveBeenCalled();
    });
});
