import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generatePaginatedResponseMetadata } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountFilterOption } from '../../hooks/useWorkspaceAccountFilter';
import * as workspaceAllAssetsAsideCard from './workspaceAllAssetsAsideCard';
import {
    type IWorkspaceAssetsAsideCardProps,
    WorkspaceAssetsAsideCard,
} from './workspaceAssetsAsideCard';
import * as workspaceDaoAssetsAsideCard from './workspaceDaoAssetsAsideCard';

describe('<WorkspaceAssetsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const allAssetsCardSpy = jest.spyOn(
        workspaceAllAssetsAsideCard,
        'WorkspaceAllAssetsAsideCard',
    );
    const daoAssetsCardSpy = jest.spyOn(
        workspaceDaoAssetsAsideCard,
        'WorkspaceDaoAssetsAsideCard',
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
        allAssetsCardSpy.mockImplementation(() => (
            <div data-testid="all-assets-mock" />
        ));
        daoAssetsCardSpy.mockImplementation(() => (
            <div data-testid="dao-assets-mock" />
        ));
    });

    afterEach(() => {
        allAssetsCardSpy.mockReset();
        daoAssetsCardSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAssetsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceAssetsAsideCardProps = { ...props };

        return (
            <GukModulesProvider>
                <WorkspaceAssetsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the aggregated card titled with the option label when all accounts are selected', () => {
        const metadata = generatePaginatedResponseMetadata();
        render(
            createTestComponent({ activeOption: allAccountsOption, metadata }),
        );

        expect(screen.getByTestId('all-assets-mock')).toBeInTheDocument();
        expect(allAssetsCardSpy).toHaveBeenLastCalledWith(
            { metadata, title: allAccountsOption.label },
            undefined,
        );
    });

    it('renders the aggregated card when no option is selected yet', () => {
        render(createTestComponent());

        expect(screen.getByTestId('all-assets-mock')).toBeInTheDocument();
        expect(allAssetsCardSpy).toHaveBeenLastCalledWith(
            { metadata: undefined, title: undefined },
            undefined,
        );
    });

    it('renders the DAO card when the selected account is a DAO', () => {
        const metadata = generatePaginatedResponseMetadata();
        const activeOption: IWorkspaceAccountFilterOption = {
            id: daoAccount.id,
            label: 'Demo DAO',
            account: daoAccount,
            isAllAccounts: false,
        };
        render(createTestComponent({ activeOption, metadata }));

        expect(screen.getByTestId('dao-assets-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('all-assets-mock')).not.toBeInTheDocument();
        expect(daoAssetsCardSpy).toHaveBeenLastCalledWith(
            { account: daoAccount, label: 'Demo DAO', metadata },
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

        expect(screen.getByTestId('all-assets-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('dao-assets-mock')).not.toBeInTheDocument();
    });
});
