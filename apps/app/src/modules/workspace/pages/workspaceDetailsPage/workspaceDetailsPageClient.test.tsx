import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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
    workspaceService,
} from '../../api/workspaceService';
import {
    type IWorkspaceDetailsPageClientProps,
    WorkspaceDetailsPageClient,
} from './workspaceDetailsPageClient';

describe('<WorkspaceDetailsPageClient /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const targetAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'test-workspace',
        name: 'Test Workspace',
        description: 'A test workspace',
        avatar: null,
        links: [],
        owner: targetAddress,
        accounts: [
            {
                id: `ethereum-sepolia-${address}`,
                type: WorkspaceAccountType.DAO,
                address,
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        targets: [],
        ...workspace,
    });

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
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
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        localStorage.clear();
    });

    let testIndex = 0;

    const createTestComponent = (
        props?: Partial<IWorkspaceDetailsPageClientProps>,
    ) => {
        testIndex += 1;
        const completeProps: IWorkspaceDetailsPageClientProps = {
            workspaceId: `test-workspace-${testIndex.toString()}`,
            ...props,
        };

        return (
            <ReactQueryWrapper client={new QueryClient()}>
                <GukModulesProvider>
                    <WorkspaceDetailsPageClient {...completeProps} />
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    it('displays the workspace metadata on the page header', async () => {
        render(createTestComponent());

        expect(await screen.findByText('Test Workspace')).toBeInTheDocument();
        expect(screen.getByText('A test workspace')).toBeInTheDocument();
    });

    it('displays the accounts with the name resolved by the accounts API', async () => {
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceDetailsPage\.section\.accounts$/),
        ).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByText('Demo DAO')).toBeInTheDocument(),
        );
    });

    it('hides the targets section when the workspace has no target', async () => {
        render(createTestComponent());

        await screen.findByText('Test Workspace');

        expect(
            screen.queryByText(/workspaceDetailsPage\.section\.targets$/),
        ).not.toBeInTheDocument();
    });

    it('displays the targets section when the workspace has targets', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({
                targets: [
                    {
                        address: targetAddress,
                        network: Network.CITREA_MAINNET,
                    },
                ],
            }),
        );
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceDetailsPage\.section\.targets$/),
        ).toBeInTheDocument();
    });

    it('displays an empty state when the workspace does not exist', async () => {
        getWorkspaceSpy.mockRejectedValue(new Error('not found'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceDetailsPage\.notFound\.title$/),
        ).toBeInTheDocument();
    });

    it('does not resolve accounts for a workspace that has none', async () => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace({ accounts: [] }));
        render(createTestComponent());

        await screen.findByText('Test Workspace');

        expect(getAccountsSpy).not.toHaveBeenCalled();
    });
});
