import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type {
    IUseWorkspaceAccountOptionsResult,
    IWorkspaceAccountOption,
} from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import { WorkspaceMembersPageClient } from './workspaceMembersPageClient';

describe('<WorkspaceMembersPageClient /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    const daoOption: IWorkspaceAccountOption = {
        id: daoAccount.id,
        label: 'Demo DAO',
        account: daoAccount,
        isAllAccounts: false,
    };

    /**
     * Mocks the hook as the aggregated route does, the workspace holding one DAO account unless set otherwise.
     */
    const mockAccountOptions = (
        result?: Partial<IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [allAccountsOption, daoOption],
            accountId: allAccountsOption.id,
            activeOption: allAccountsOption,
            isAllAccounts: true,
            ...result,
        });

    beforeEach(() => {
        mockAccountOptions();
    });

    afterEach(() => {
        useWorkspaceAccountOptionsSpy.mockReset();
    });

    const createTestComponent = () => (
        <GukModulesProvider>
            <WorkspaceMembersPageClient />
        </GukModulesProvider>
    );

    // Members are read one account at a time, so the aggregated page has no list to show — only somewhere to send
    // the reader. The list itself lives on the account-scoped route.
    it('asks to pick an account when the workspace has DAO accounts', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceMembersPage\.selectAccount\.heading$/),
        ).toBeInTheDocument();
    });

    it('says there are no members at all for a workspace without DAO accounts', () => {
        mockAccountOptions({ options: [allAccountsOption] });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceMembersPage\.emptyState\.heading$/),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/workspaceMembersPage\.selectAccount\.heading$/),
        ).not.toBeInTheDocument();
    });
});
