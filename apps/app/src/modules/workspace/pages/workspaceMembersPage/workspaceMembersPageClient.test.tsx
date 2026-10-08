import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import { WorkspaceMemberList } from '../../components/workspaceMemberList';
import { WorkspaceMembersAsideCard } from '../../components/workspaceMembersAsideCard';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import {
    type IWorkspaceMembersPageClientProps,
    WorkspaceMembersPageClient,
} from './workspaceMembersPageClient';

jest.mock('../../components/workspaceMemberList', () => ({
    WorkspaceMemberList: jest.fn(() => <div data-testid="list-mock" />),
}));

jest.mock('../../components/workspaceMembersAsideCard', () => ({
    WorkspaceMembersAsideCard: jest.fn(() => (
        <div data-testid="aside-card-mock" />
    )),
}));

describe('<WorkspaceMembersPageClient /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const memberListMock = WorkspaceMemberList as jest.Mock;
    const asideCardMock = WorkspaceMembersAsideCard as jest.Mock;
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

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
    };

    const workspace: IWorkspace = {
        id: 'demo',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        owner: daoAddress,
        accounts: [daoAccount, safeAccount],
        targets: [],
    };

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(workspace);
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [allAccountsOption],
            accountId: allAccountsOption.id,
            activeOption: allAccountsOption,
            isAllAccounts: true,
        });
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        memberListMock.mockClear();
        asideCardMock.mockClear();
        useWorkspaceAccountOptionsSpy.mockReset();
    });

    // The query client must sit inside the gov-ui-kit provider, which carries a query client of its own that would
    // otherwise shadow this one.
    const createTestComponent = (
        props?: Partial<IWorkspaceMembersPageClientProps>,
    ) => {
        const completeProps: IWorkspaceMembersPageClientProps = {
            workspaceId: 'demo',
            pageSize: 18,
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

    it('renders the page title, the member list and the aside card', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceMembersPage\.main\.title$/),
        ).toBeInTheDocument();
        expect(screen.getByTestId('list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('aside-card-mock')).toBeInTheDocument();
    });

    // Safe owners are members of the workspace too, so every account is listed, not only the DAOs.
    it('lists the members of every account of the workspace', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(memberListMock).toHaveBeenLastCalledWith(
                {
                    workspaceId: 'demo',
                    accounts: [daoAccount, safeAccount],
                    pageSize: 18,
                },
                undefined,
            ),
        );
    });

    it('hands the aside card every account and the active option', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(asideCardMock).toHaveBeenLastCalledWith(
                {
                    accounts: [daoAccount, safeAccount],
                    activeOption: allAccountsOption,
                    pageSize: 18,
                },
                undefined,
            ),
        );
    });
});
