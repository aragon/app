import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
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
import * as workspaceAssetsAsideCardModule from '../../components/workspaceAssetsAsideCard';
import type {
    IUseWorkspaceAccountOptionsResult,
    IWorkspaceAccountOption,
} from '../../hooks/useWorkspaceAccountOptions';
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
    // Stubbed below: the aside renders a DAO card that reads the DAO, which belongs to its own tests. Here only
    // what the page hands it matters.
    const assetsAsideCardSpy = jest.spyOn(
        workspaceAssetsAsideCardModule,
        'WorkspaceAssetsAsideCard',
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

    const buildSafeAccount = (safeAddress: string): IWorkspaceAccount => ({
        id: `ethereum-sepolia-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
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
            buildSafeAccount(params.safeAddress),
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
     * Mocks the hook as the aggregated route does, the overrides standing in for an account-scoped route.
     */
    const mockAccountOptions = (
        daoAddress: string,
        overrides?: Partial<IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [allAccountsOption, buildDaoOption(daoAddress)],
            accountId: allAccountsOption.id,
            activeOption: allAccountsOption,
            isAllAccounts: true,
            ...overrides,
        });

    const expectAssetsRequestedFor = async (accounts: IWorkspaceAccount[]) =>
        waitFor(() =>
            expect(getWorkspaceAssetsSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: expect.objectContaining({
                        accounts: accounts.map(({ network, address }) => ({
                            network,
                            address,
                        })),
                    }),
                }),
            ),
        );

    beforeEach(() => {
        assetsAsideCardSpy.mockImplementation(() => null);
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
        assetsAsideCardSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAssetsPageClientProps>,
        accountOptions?: (addresses: {
            daoAddress: string;
            safeAddress: string;
        }) => Partial<IUseWorkspaceAccountOptionsResult>,
    ) => {
        const addresses = nextAddresses();
        getWorkspaceSpy.mockResolvedValue(buildWorkspace(addresses));
        mockAccountOptions(addresses.daoAddress, accountOptions?.(addresses));

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

    it('reads the workspace assets API for the aggregated scope, with every account', async () => {
        const { component, daoAddress, safeAddress } = createTestComponent();
        render(component);

        await expectAssetsRequestedFor([
            buildDaoAccount(daoAddress),
            buildSafeAccount(safeAddress),
        ]);
    });

    it('reads the workspace assets API for a DAO account scope, with that account only', async () => {
        const { component, daoAddress } = createTestComponent(
            undefined,
            ({ daoAddress: address }) => ({
                accountId: `ethereum-sepolia-${address}`,
                activeOption: buildDaoOption(address),
                isAllAccounts: false,
            }),
        );
        render(component);

        await expectAssetsRequestedFor([buildDaoAccount(daoAddress)]);
    });

    // A Safe is a scope but never an option, so narrowing by the option would show the whole workspace here.
    it('reads the workspace assets API for a Safe account scope, with that account only', async () => {
        const { component, safeAddress } = createTestComponent(
            undefined,
            ({ safeAddress: address }) => ({
                accountId: `ethereum-sepolia-${address}`,
                activeOption: undefined,
                isAllAccounts: false,
            }),
        );
        render(component);

        await expectAssetsRequestedFor([buildSafeAccount(safeAddress)]);
    });

    // Viewing an account the workspace does not hold is not supported yet, so the route falls back to every
    // account rather than to an empty list.
    it('reads every account when the route names an account the workspace does not hold', async () => {
        const { component, daoAddress, safeAddress } = createTestComponent(
            undefined,
            () => ({
                accountId: `ethereum-sepolia-${nextAddresses().daoAddress}`,
                activeOption: undefined,
                isAllAccounts: false,
            }),
        );
        render(component);

        await expectAssetsRequestedFor([
            buildDaoAccount(daoAddress),
            buildSafeAccount(safeAddress),
        ]);
    });

    it('hands the active option to the aside', async () => {
        const { component, daoAddress } = createTestComponent(
            undefined,
            ({ daoAddress: address }) => ({
                accountId: `ethereum-sepolia-${address}`,
                activeOption: buildDaoOption(address),
                isAllAccounts: false,
            }),
        );
        render(component);

        await waitFor(() =>
            expect(assetsAsideCardSpy).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    activeOption: buildDaoOption(daoAddress),
                }),
                undefined,
            ),
        );
    });

    it('hands the totals of the selection to the aside', async () => {
        const { component } = createTestComponent();
        render(component);

        await waitFor(() =>
            expect(assetsAsideCardSpy).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    metadata: expect.objectContaining({
                        totalAmountUsd: '1234',
                        totalRecords: 7,
                    }),
                }),
                undefined,
            ),
        );
    });
});
