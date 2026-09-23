import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountFilterOption } from '../../hooks/useWorkspaceAccountFilter';
import * as workspaceAllProposalsAsideCard from './workspaceAllProposalsAsideCard';
import * as workspaceDaoProposalsAsideCard from './workspaceDaoProposalsAsideCard';
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

    const allAccountsOption: IWorkspaceAccountFilterOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    beforeEach(() => {
        allProposalsCardSpy.mockImplementation(() => (
            <div data-testid="all-proposals-mock" />
        ));
        daoProposalsCardSpy.mockImplementation(() => (
            <div data-testid="dao-proposals-mock" />
        ));
    });

    afterEach(() => {
        allProposalsCardSpy.mockReset();
        daoProposalsCardSpy.mockReset();
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
        const activeOption: IWorkspaceAccountFilterOption = {
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
        const activeOption: IWorkspaceAccountFilterOption = {
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
});
