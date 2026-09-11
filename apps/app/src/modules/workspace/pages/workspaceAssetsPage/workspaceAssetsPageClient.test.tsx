import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { financeService } from '@/modules/finance/api/financeService';
import { daoService, Network } from '@/shared/api/daoService';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import {
    generateDao,
    generateDaoMetrics,
    generatePaginatedResponse,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
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
    const getDaoAssetsSpy = jest.spyOn(financeService, 'getAssetList');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    // The DAO aside card pulls in DAO components that read feature flags.
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
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
            {
                id: `ethereum-sepolia-${params.daoAddress}`,
                type: WorkspaceAccountType.DAO,
                address: params.daoAddress,
                network: Network.ETHEREUM_SEPOLIA,
            },
            {
                id: `ethereum-sepolia-${params.safeAddress}`,
                type: WorkspaceAccountType.SAFE,
                address: params.safeAddress,
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        targets: [],
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
        getDaoAssetsSpy.mockResolvedValue(
            generatePaginatedResponse({ data: [] }),
        );
        // The account tabs display the DAO's own aside card, which reads the DAO metrics.
        getDaoSpy.mockResolvedValue(
            generateDao({ metrics: generateDaoMetrics({ tvlUSD: '4200' }) }),
        );
        useFeatureFlagsSpy.mockReturnValue({
            snapshot: [],
            isEnabled: () => false,
            setOverride: jest.fn(),
        });
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        getWorkspaceAssetsSpy.mockReset();
        getDaoAssetsSpy.mockReset();
        getDaoSpy.mockReset();
        useFeatureFlagsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAssetsPageClientProps>,
    ) => {
        const addresses = nextAddresses();
        getWorkspaceSpy.mockResolvedValue(buildWorkspace(addresses));

        const completeProps: IWorkspaceAssetsPageClientProps = {
            workspaceId: `test-workspace-${testIndex.toString()}`,
            pageSize: 20,
            ...props,
        };

        const component = (
            <ReactQueryWrapper client={new QueryClient()}>
                <GukModulesProvider>
                    <WorkspaceAssetsPageClient {...completeProps} />
                </GukModulesProvider>
            </ReactQueryWrapper>
        );

        return { component, ...addresses };
    };

    it('gives a tab to the aggregated view and to DAO accounts only', async () => {
        const { component, daoAddress, safeAddress } = createTestComponent();
        render(component);

        expect(
            await screen.findByText(addressUtils.truncateAddress(daoAddress)),
        ).toBeInTheDocument();
        // The Safe has no tab: the single DAO endpoints cannot answer for it.
        expect(
            screen.queryByText(addressUtils.truncateAddress(safeAddress)),
        ).not.toBeInTheDocument();
    });

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
        expect(getDaoAssetsSpy).not.toHaveBeenCalled();
    });

    it('reads the single DAO assets API when an account tab is selected', async () => {
        const { component, daoAddress } = createTestComponent();
        render(component);

        const accountTab = await screen.findByText(
            addressUtils.truncateAddress(daoAddress),
        );
        await userEvent.click(accountTab);

        await waitFor(() =>
            expect(getDaoAssetsSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryParams: expect.objectContaining({
                        daoId: `ethereum-sepolia-${daoAddress}`,
                    }),
                }),
            ),
        );
    });

    it('displays the DAO aside card of the account when its tab is selected', async () => {
        // `DaoInfoAside` only renders the stats it is given when `linkedAccount` is enabled, exactly as on the DAO
        // assets page; with the flag off it falls back to `FinanceDetailsList`.
        useFeatureFlagsSpy.mockReturnValue({
            snapshot: [],
            isEnabled: (key) => key === 'linkedAccount',
            setOverride: jest.fn(),
        });
        const { component, daoAddress } = createTestComponent();
        render(component);

        await userEvent.click(
            await screen.findByText(addressUtils.truncateAddress(daoAddress)),
        );

        await waitFor(() =>
            expect(getDaoSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    urlParams: { id: `ethereum-sepolia-${daoAddress}` },
                }),
            ),
        );
        // The DAO card's own stats, the same ones the DAO assets page shows.
        expect(
            await screen.findByText(/assetListStats\.totalValueUsd$/),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/workspaceAssetsAsideCard\.totalValue$/),
        ).not.toBeInTheDocument();
    });

    it('displays the totals of the whole selection on the aside', async () => {
        const { component } = createTestComponent();
        render(component);

        expect(
            await screen.findByText(/workspaceAssetsAsideCard\.totalValue$/),
        ).toBeInTheDocument();
    });
});
