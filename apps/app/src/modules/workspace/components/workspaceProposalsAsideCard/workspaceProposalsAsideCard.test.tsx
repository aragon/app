import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import type { IWorkspaceProposalTab } from '../../hooks/useWorkspaceProposalTabs';
import * as workspaceAllProposalsAsideCard from './workspaceAllProposalsAsideCard';
import * as workspaceDaoProposalsAsideCard from './workspaceDaoProposalsAsideCard';
import * as workspaceProcessProposalsAsideCard from './workspaceProcessProposalsAsideCard';
import {
    type IWorkspaceProposalsAsideCardProps,
    WorkspaceProposalsAsideCard,
} from './workspaceProposalsAsideCard';

describe('<WorkspaceProposalsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const allProposalsCardSpy = jest.spyOn(
        workspaceAllProposalsAsideCard,
        'WorkspaceAllProposalsAsideCard',
    );
    const daoProposalsCardSpy = jest.spyOn(
        workspaceDaoProposalsAsideCard,
        'WorkspaceDaoProposalsAsideCard',
    );
    const processProposalsCardSpy = jest.spyOn(
        workspaceProcessProposalsAsideCard,
        'WorkspaceProcessProposalsAsideCard',
    );
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

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    const buildProcessTab = (label: string) =>
        ({
            accountId: daoAccount.id,
            id: 'multisig',
            uniqueId: `${Network.ETHEREUM_SEPOLIA}-0xMultisig-mul`,
            label,
            meta: generateDaoPlugin({ address: '0xMultisig', slug: 'mul' }),
            props: {},
        }) as IWorkspaceProposalTab;

    beforeEach(() => {
        allProposalsCardSpy.mockImplementation(() => (
            <div data-testid="all-proposals-mock" />
        ));
        daoProposalsCardSpy.mockImplementation(() => (
            <div data-testid="dao-proposals-mock" />
        ));
        processProposalsCardSpy.mockImplementation(() => (
            <div data-testid="process-proposals-mock" />
        ));
    });

    afterEach(() => {
        allProposalsCardSpy.mockReset();
        daoProposalsCardSpy.mockReset();
        processProposalsCardSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceProposalsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceProposalsAsideCardProps = {
            accounts: [daoAccount],
            pageSize: 20,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceProposalsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the aggregated card titled with the option label when all accounts are selected', () => {
        render(createTestComponent({ activeOption: allAccountsOption }));

        expect(screen.getByTestId('all-proposals-mock')).toBeInTheDocument();
        expect(allProposalsCardSpy).toHaveBeenLastCalledWith(
            {
                accounts: [daoAccount],
                pageSize: 20,
                title: allAccountsOption.label,
            },
            undefined,
        );
    });

    it('renders the aggregated card when no option is selected yet', () => {
        render(createTestComponent());

        expect(screen.getByTestId('all-proposals-mock')).toBeInTheDocument();
        expect(allProposalsCardSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({ title: undefined }),
            undefined,
        );
    });

    it('renders the DAO card when the selected account is a DAO', () => {
        const activeOption: IWorkspaceAccountOption = {
            id: daoAccount.id,
            label: 'Demo DAO',
            account: daoAccount,
            isAllAccounts: false,
        };
        render(createTestComponent({ activeOption }));

        expect(screen.getByTestId('dao-proposals-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('all-proposals-mock'),
        ).not.toBeInTheDocument();
        expect(daoProposalsCardSpy).toHaveBeenLastCalledWith(
            { account: daoAccount, label: 'Demo DAO', pageSize: 20 },
            undefined,
        );
    });

    it('falls back to the aggregated card for account types with no card of their own', () => {
        const activeOption: IWorkspaceAccountOption = {
            id: safeAccount.id,
            label: 'Demo Safe',
            account: safeAccount,
            isAllAccounts: false,
        };
        render(createTestComponent({ activeOption }));

        expect(screen.getByTestId('all-proposals-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('dao-proposals-mock'),
        ).not.toBeInTheDocument();
    });
    // A process tab names one process of one account, so it describes the list better than the scope does.
    it('renders the process card when a process tab is selected, whatever the scope', () => {
        const tab = buildProcessTab('Demo DAO · Multisig');
        render(
            createTestComponent({
                activeOption: allAccountsOption,
                activeTab: tab,
            }),
        );

        expect(
            screen.getByTestId('process-proposals-mock'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('all-proposals-mock'),
        ).not.toBeInTheDocument();
        expect(processProposalsCardSpy).toHaveBeenLastCalledWith(
            { tab },
            undefined,
        );
    });

    it('prefers the process card over the card of the account the route names', () => {
        const activeOption: IWorkspaceAccountOption = {
            id: daoAccount.id,
            label: 'Demo DAO',
            account: daoAccount,
            isAllAccounts: false,
        };
        render(
            createTestComponent({
                activeOption,
                activeTab: buildProcessTab('Multisig'),
            }),
        );

        expect(
            screen.getByTestId('process-proposals-mock'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('dao-proposals-mock'),
        ).not.toBeInTheDocument();
    });
});
