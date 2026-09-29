import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceDetailsPageOverviewProps,
    WorkspaceDetailsPageOverview,
} from './workspaceDetailsPageOverview';

describe('<WorkspaceDetailsPageOverview /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const targetAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

    let testIndex = 0;

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => {
        testIndex += 1;

        return {
            id: `test-workspace-${testIndex.toString()}`,
            name: 'Test Workspace',
            description: 'A test workspace',
            avatar: null,
            links: [],
            owner: targetAddress,
            accounts: [
                {
                    id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
                    type: WorkspaceAccountType.DAO,
                    address,
                    network: Network.ETHEREUM_SEPOLIA,
                },
            ],
            targets: [],
            ...workspace,
        };
    };

    beforeEach(() => {
        getAccountsSpy.mockResolvedValue([
            {
                network: Network.ETHEREUM_SEPOLIA,
                address,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            },
        ]);
    });

    afterEach(() => {
        getAccountsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceDetailsPageOverviewProps>,
    ) => {
        const completeProps: IWorkspaceDetailsPageOverviewProps = {
            workspace: buildWorkspace(),
            ...props,
        };

        // The query client must sit inside the gov-ui-kit provider, which carries a query client of its own that
        // would otherwise shadow this one.
        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceDetailsPageOverview {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('displays the workspace metadata on the page header', () => {
        render(createTestComponent());

        expect(screen.getByText('Test Workspace')).toBeInTheDocument();
        expect(screen.getByText('A test workspace')).toBeInTheDocument();
    });

    it('displays the accounts with the name resolved by the accounts API', async () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceDetailsPage\.section\.accounts$/),
        ).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByText('Demo DAO')).toBeInTheDocument(),
        );
    });

    it('hides the targets section when the workspace has no target', () => {
        render(createTestComponent());

        expect(
            screen.queryByText(/workspaceDetailsPage\.section\.targets$/),
        ).not.toBeInTheDocument();
    });

    it('displays the targets section when the workspace has targets', () => {
        const workspace = buildWorkspace({
            targets: [
                { address: targetAddress, network: Network.CITREA_MAINNET },
            ],
        });
        render(createTestComponent({ workspace }));

        expect(
            screen.getByText(/workspaceDetailsPage\.section\.targets$/),
        ).toBeInTheDocument();
    });

    it('does not resolve accounts for a workspace that has none', () => {
        const workspace = buildWorkspace({ accounts: [] });
        render(createTestComponent({ workspace }));

        expect(screen.getByText('Test Workspace')).toBeInTheDocument();
        expect(getAccountsSpy).not.toHaveBeenCalled();
    });
});
