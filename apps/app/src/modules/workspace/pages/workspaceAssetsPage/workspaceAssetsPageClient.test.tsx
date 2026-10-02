import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import {
    type IWorkspaceAssetsPageClientProps,
    WorkspaceAssetsPageClient,
} from './workspaceAssetsPageClient';

describe('<WorkspaceAssetsPageClient /> component', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const getWorkspaceAssetsSpy = jest.spyOn(
        workspaceQueryService,
        'getAssetList',
    );
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );

    // React Query dedupes by key and the asset key is built from the accounts, so each test gets its own addresses:
    // otherwise a result cached by an earlier test satisfies the render and this test's own mock never runs.
    let testIndex = 0;
    const nextAddresses = () => {
        testIndex += 1;
        const suffix = testIndex.toString().padStart(2, '0');

        return {
            daoAddress: `0xE8fd9Fe445A037ee07fb98FDD4b146d939140${suffix}5`,
            safeAddress: `0xA941b1C1D9aDC88C9241aA3ACA59E8B8f03864${suffix}`,
        };
    };

    const buildDaoAccount = (daoAddress: string): IWorkspaceAccount => ({
        id: `ethereum-sepolia-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    });

    const buildWorkspace = (params: {
        daoAddress: string;
        safeAddress: string;
    }): IWorkspace => ({
        id: 'test-workspace',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        owner: params.safeAddress,
        accounts: [
            buildDaoAccount(params.daoAddress),
            {
                id: `ethereum-sepolia-${params.safeAddress}`,
                type: WorkspaceAccountType.SAFE,
                address: params.safeAddress,
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        targets: [],
    });

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    const buildDaoOption = (daoAddress: string): IWorkspaceAccountOption => ({
        id: `ethereum-sepolia-${daoAddress}`,
        label: 'Demo DAO',
        account: buildDaoAccount(daoAddress),
        isAllAccounts: false,
    });

    /**
     * Mocks the hook as the aggregated route does: the page is only reachable there, so the DAO account is an
     * option to switch to rather than the one being looked at.
     */
    const mockAccountOptions = (daoAddress: string) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [allAccountsOption, buildDaoOption(daoAddress)],
            accountId: allAccountsOption.id,
            activeOption: allAccountsOption,
            isAllAccounts: true,
        });

    beforeEach(() => {
        getAccountsSpy.mockResolvedValue([]);
        getWorkspaceAssetsSpy.mockResolvedValue({
            data: [],
            metadata: {
                page: 1,
                pageSize: 20,
                totalPages: 1,
                totalRecords: 7,
                totalAmountUsd: '1234',
            },
            coverage: [],
            partial: false,
        });
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        getWorkspaceAssetsSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAssetsPageClientProps>,
    ) => {
        const addresses = nextAddresses();
        getWorkspaceSpy.mockResolvedValue(buildWorkspace(addresses));
        mockAccountOptions(addresses.daoAddress);

        const completeProps: IWorkspaceAssetsPageClientProps = {
            workspaceId: `test-workspace-${testIndex.toString()}`,
            pageSize: 20,
            ...props,
        };

        const component = (
            <ReactQueryWrapper client={new QueryClient()}>
                <FeatureFlagsProvider>
                    <GukModulesProvider>
                        <WorkspaceAssetsPageClient {...completeProps} />
                    </GukModulesProvider>
                </FeatureFlagsProvider>
            </ReactQueryWrapper>
        );

        return { component, ...addresses };
    };

    it('reads the workspace assets API for the aggregated tab, with every account', async () => {
        const { component, daoAddress, safeAddress } = createTestComponent();
        render(component);

        await waitFor(() =>
            expect(getWorkspaceAssetsSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        accounts: [
                            {
                                network: Network.ETHEREUM_SEPOLIA,
                                address: daoAddress,
                            },
                            {
                                network: Network.ETHEREUM_SEPOLIA,
                                address: safeAddress,
                            },
                        ],
                    }),
                }),
            ),
        );
    });

    it('displays the totals of the aggregated tab on the aside', async () => {
        const { component } = createTestComponent();
        render(component);

        expect(
            await screen.findByText(/workspaceAllAssetsAsideCard\.totalValue$/),
        ).toBeInTheDocument();
    });
});
