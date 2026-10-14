import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import type { IWorkspaceMemberTab } from '../../hooks/useWorkspaceMemberTabs';
import * as workspaceAllMembersAsideCard from './workspaceAllMembersAsideCard';
import * as workspaceBodyMembersAsideCard from './workspaceBodyMembersAsideCard';
import {
    type IWorkspaceMembersAsideCardProps,
    WorkspaceMembersAsideCard,
} from './workspaceMembersAsideCard';

describe('<WorkspaceMembersAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const allMembersCardSpy = jest.spyOn(
        workspaceAllMembersAsideCard,
        'WorkspaceAllMembersAsideCard',
    );
    const bodyMembersCardSpy = jest.spyOn(
        workspaceBodyMembersAsideCard,
        'WorkspaceBodyMembersAsideCard',
    );

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    const bodyTab = {
        accountId: daoAccount.id,
        id: 'multisig',
        uniqueId: `${Network.ETHEREUM_SEPOLIA}-0xMultisig-mul`,
        label: 'Multisig',
        meta: generateDaoPlugin({ address: '0xMultisig', slug: 'mul' }),
        props: {},
    } as IWorkspaceMemberTab;

    beforeEach(() => {
        allMembersCardSpy.mockImplementation(() => (
            <div data-testid="all-members-mock" />
        ));
        bodyMembersCardSpy.mockImplementation(() => (
            <div data-testid="body-members-mock" />
        ));
    });

    afterEach(() => {
        allMembersCardSpy.mockReset();
        bodyMembersCardSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceMembersAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceMembersAsideCardProps = {
            accounts: [daoAccount],
            pageSize: 20,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceMembersAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the aggregated card titled with the option label while no body is selected', () => {
        render(createTestComponent({ activeOption: allAccountsOption }));

        expect(screen.getByTestId('all-members-mock')).toBeInTheDocument();
        expect(allMembersCardSpy).toHaveBeenLastCalledWith(
            {
                accounts: [daoAccount],
                activeOption: allAccountsOption,
                pageSize: 20,
            },
            undefined,
        );
    });

    // A body tab names one body of one account, so it describes the list better than the aggregate does.
    it('renders the body card when a body tab is selected', () => {
        render(
            createTestComponent({
                activeOption: allAccountsOption,
                activeTab: bodyTab,
            }),
        );

        expect(screen.getByTestId('body-members-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('all-members-mock'),
        ).not.toBeInTheDocument();
        expect(bodyMembersCardSpy).toHaveBeenLastCalledWith(
            { tab: bodyTab },
            undefined,
        );
    });
});
