import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import {
    DaoMembersPageClient,
    type IDaoMembersPageClientProps,
} from '@/modules/governance/pages/daoMembersPage';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import * as workspaceAccountSelectorProvider from '../../components/workspaceAccountSelectorProvider';
import {
    type IWorkspaceMembersPageClientProps,
    WorkspaceMembersPageClient,
} from './workspaceMembersPageClient';

jest.mock('@/modules/governance/pages/daoMembersPage', () => ({
    DaoMembersPageClient: jest.fn(() => (
        <div data-testid="dao-members-page-mock" />
    )),
}));

describe('<WorkspaceMembersPageClient /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const useWorkspaceAccountSelectorContextSpy = jest.spyOn(
        workspaceAccountSelectorProvider,
        'useWorkspaceAccountSelectorContext',
    );
    const daoMembersPageMock = DaoMembersPageClient as jest.Mock;

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
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
     * Mocks the account selector context, the DAO option being active unless set otherwise.
     */
    const mockAccountSelector = (
        context?: Partial<workspaceAccountSelectorProvider.IWorkspaceAccountSelectorContext>,
    ) =>
        useWorkspaceAccountSelectorContextSpy.mockReturnValue({
            activeOption: daoOption,
            setActiveOption: jest.fn(),
            options: [allAccountsOption, daoOption],
            ...context,
        });

    /**
     * Props of the last render of the DAO members page.
     */
    const lastDaoMembersPageProps = () =>
        daoMembersPageMock.mock.calls.at(-1)?.[0] as
            | IDaoMembersPageClientProps
            | undefined;

    beforeEach(() => {
        getDaoSpy.mockResolvedValue(generateDao());
        mockAccountSelector();
    });

    afterEach(() => {
        getDaoSpy.mockReset();
        useWorkspaceAccountSelectorContextSpy.mockReset();
        daoMembersPageMock.mockClear();
    });

    // The query client must sit inside the gov-ui-kit provider: that provider carries a query client of its own,
    // which would otherwise shadow this one and share its cache with every other test of this file.
    const createTestComponent = (
        props?: Partial<IWorkspaceMembersPageClientProps>,
    ) => {
        const completeProps: IWorkspaceMembersPageClientProps = {
            pageSize: 18,
            featuredDelegates: [],
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceMembersPageClient {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('renders the DAO members page of the selected account', async () => {
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

    it('displays a loading list while the DAO of the selected account is loading', () => {
        getDaoSpy.mockReturnValue(new Promise(() => undefined));
        const { container } = render(createTestComponent());

        expect(
            container.querySelectorAll('[aria-busy="true"]').length,
        ).toBeGreaterThan(0);
        // The aside column is reserved so the skeleton cards match the width of the member cards.
        expect(container.querySelector('aside')).toBeInTheDocument();
        expect(daoMembersPageMock).not.toHaveBeenCalled();
    });

    it('displays an error instead of the DAO members page when the DAO of the selected account fails to load', async () => {
        getDaoSpy.mockRejectedValue(new Error('bad request'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceMembersPage\.daoError\.heading$/),
        ).toBeInTheDocument();
        expect(daoMembersPageMock).not.toHaveBeenCalled();
        expect(getDaoSpy).toHaveBeenCalledTimes(1);
    });

    it('asks to select an account when every account is selected', () => {
        mockAccountSelector({ activeOption: allAccountsOption });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceMembersPage\.selectAccount\.heading$/),
        ).toBeInTheDocument();
        expect(getDaoSpy).not.toHaveBeenCalled();
        expect(daoMembersPageMock).not.toHaveBeenCalled();
    });

    it('displays an empty state for a workspace without DAO accounts', () => {
        mockAccountSelector({
            activeOption: allAccountsOption,
            options: [allAccountsOption],
        });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceMembersPage\.emptyState\.heading$/),
        ).toBeInTheDocument();
        expect(daoMembersPageMock).not.toHaveBeenCalled();
    });
});
