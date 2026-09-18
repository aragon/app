import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
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
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        getWorkspaceAssetsSpy.mockReset();
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

    it('gives an option to the aggregated view and to every account, Safes included', async () => {
        const { component, daoAddress, safeAddress } = createTestComponent();
        render(component);

        await openAccountDropdown();

        expect(
            await screen.findByText(addressUtils.truncateAddress(daoAddress)),
        ).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(safeAddress)),
        ).toBeInTheDocument();
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

    it('serves a Safe account its own tab, which the single DAO endpoints cannot answer for', async () => {
        const { component, safeAddress } = createTestComponent();
        render(component);

        await selectAccount(safeAddress);

        await waitFor(() =>
            expect(getWorkspaceAssetsSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        accounts: [
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

    it('displays the totals of the selected tab on the aside', async () => {
        const { component, safeAddress } = createTestComponent();
        render(component);

        expect(
            await screen.findByText(/workspaceAssetsAsideCard\.totalValue$/),
        ).toBeInTheDocument();

        // The same card serves an account tab, so a Safe gets the totals a DAO does.
        await selectAccount(safeAddress);

        expect(
            await screen.findByText(/workspaceAssetsAsideCard\.totalValue$/),
        ).toBeInTheDocument();
    });
});
