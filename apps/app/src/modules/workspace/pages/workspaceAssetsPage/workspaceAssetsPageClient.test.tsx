import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { daoService, Network } from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
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
    // Read by the aside card of a DAO account, which renders the DAO's own card.
    const getDaoSpy = jest.spyOn(daoService, 'getDao');

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
        getDaoSpy.mockResolvedValue(generateDao());
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
        getDaoSpy.mockReset();
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
                <FeatureFlagsProvider>
                    <GukModulesProvider>
                        <WorkspaceAssetsPageClient {...completeProps} />
                    </GukModulesProvider>
                </FeatureFlagsProvider>
            </ReactQueryWrapper>
        );

        return { component, ...addresses };
    };

    // The accounts are behind the account dropdown, labelled with the currently selected option.
    const openAccountDropdown = async () =>
        userEvent.click(
            await screen.findByRole('button', {
                name: 'app.workspace.workspaceAssetsPage.filter.allAccounts',
            }),
        );

    const selectAccount = async (address: string) => {
        await openAccountDropdown();
        await userEvent.click(
            await screen.findByText(addressUtils.truncateAddress(address)),
        );
    };

    it('gives an option to the aggregated view and to the DAO accounts only', async () => {
        const { component, daoAddress, safeAddress } = createTestComponent();
        render(component);

        await openAccountDropdown();

        expect(
            await screen.findByText(addressUtils.truncateAddress(daoAddress)),
        ).toBeInTheDocument();
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
    });

    it('narrows the same API to the selected account instead of the single DAO endpoint', async () => {
        const { component, daoAddress } = createTestComponent();
        render(component);

        await selectAccount(daoAddress);

        await waitFor(() =>
            expect(getWorkspaceAssetsSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        accounts: [
                            {
                                network: Network.ETHEREUM_SEPOLIA,
                                address: daoAddress,
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

    it('swaps the aside for the DAO card when a DAO account is selected', async () => {
        const { component, daoAddress } = createTestComponent();
        render(component);

        await selectAccount(daoAddress);

        await waitFor(() =>
            expect(getDaoSpy).toHaveBeenCalledWith({
                urlParams: { id: `ethereum-sepolia-${daoAddress}` },
            }),
        );
        expect(
            screen.queryByText(/workspaceAllAssetsAsideCard\.totalValue$/),
        ).not.toBeInTheDocument();
    });
});
