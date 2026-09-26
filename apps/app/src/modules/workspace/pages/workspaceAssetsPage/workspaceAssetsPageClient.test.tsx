import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { daoService, Network } from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import * as workspaceAccountSelectorProvider from '../../components/workspaceAccountSelectorProvider';
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
    const useWorkspaceAccountSelectorContextSpy = jest.spyOn(
        workspaceAccountSelectorProvider,
        'useWorkspaceAccountSelectorContext',
    );
    const setActiveOptionMock = jest.fn();

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

    const allAccountsOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        { id: 'all', label: 'All accounts', isAllAccounts: true };

    const buildDaoOption = (
        daoAddress: string,
    ): workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption => ({
        id: `ethereum-sepolia-${daoAddress}`,
        label: 'Demo DAO',
        account: buildDaoAccount(daoAddress),
        isAllAccounts: false,
    });

    /**
     * Mocks the account selector context with the aggregated and the DAO options, the given one being active.
     */
    const mockAccountSelector = (params: {
        daoAddress: string;
        isDaoActive?: boolean;
    }) => {
        const daoOption = buildDaoOption(params.daoAddress);

        useWorkspaceAccountSelectorContextSpy.mockReturnValue({
            activeOption: params.isDaoActive ? daoOption : allAccountsOption,
            setActiveOption: setActiveOptionMock,
            options: [allAccountsOption, daoOption],
        });
    };

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
        useWorkspaceAccountSelectorContextSpy.mockReset();
        setActiveOptionMock.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAssetsPageClientProps>,
        isDaoActive?: boolean,
    ) => {
        const addresses = nextAddresses();
        getWorkspaceSpy.mockResolvedValue(buildWorkspace(addresses));
        mockAccountSelector({ daoAddress: addresses.daoAddress, isDaoActive });

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

    it('selects the account picked on the account dropdown', async () => {
        const { component, daoAddress } = createTestComponent();
        render(component);

        await userEvent.click(
            await screen.findByRole('button', {
                name: allAccountsOption.label,
            }),
        );
        await userEvent.click(await screen.findByText('Demo DAO'));

        expect(setActiveOptionMock).toHaveBeenCalledWith(
            buildDaoOption(daoAddress),
        );
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
        const { component, daoAddress } = createTestComponent({}, true);
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
        const { component, daoAddress } = createTestComponent({}, true);
        render(component);

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
