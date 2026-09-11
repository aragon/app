import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAssetListResponse,
    WorkspaceCoverageSource,
    WorkspaceCoverageStatus,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAssetListProps,
    WorkspaceAssetList,
} from './workspaceAssetList';

describe('<WorkspaceAssetList /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const account = { network: Network.ETHEREUM_SEPOLIA, address };

    // React Query dedupes by key, so each test gets its own account: a result cached by an earlier test would
    // otherwise satisfy a later render and its own mock would never be called.
    let testIndex = 0;
    const nextAccount = () => {
        testIndex += 1;
        return {
            ...account,
            address: address.replace(
                /.{2}$/,
                testIndex.toString().padStart(2, '0'),
            ),
        };
    };

    const getAssetListSpy = jest.spyOn(workspaceQueryService, 'getAssetList');

    const buildResponse = (
        response?: Partial<IWorkspaceAssetListResponse>,
    ): IWorkspaceAssetListResponse => ({
        data: [],
        metadata: { page: 1, pageSize: 20, totalPages: 1, totalRecords: 0 },
        coverage: [],
        partial: false,
        ...response,
    });

    const buildCoverage = (
        status: WorkspaceCoverageStatus,
        coverageAccount = account,
    ) => ({
        account: coverageAccount,
        resource: 'assets',
        source: WorkspaceCoverageSource.INDEX,
        status,
    });

    beforeEach(() => {
        getAssetListSpy.mockResolvedValue(buildResponse());
    });

    afterEach(() => {
        getAssetListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWorkspaceAssetListProps>) => {
        const completeProps: IWorkspaceAssetListProps = {
            accounts: [nextAccount()],
            pageSize: 20,
            ...props,
        };

        return (
            <ReactQueryWrapper client={new QueryClient()}>
                <GukModulesProvider>
                    <WorkspaceAssetList {...completeProps} />
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    it('reads the assets of the given accounts', async () => {
        render(createTestComponent({ accounts: [account] }));

        await waitFor(() =>
            expect(getAssetListSpy).toHaveBeenCalledWith({
                body: { accounts: [account], pagination: { pageSize: 20 } },
            }),
        );
    });

    it('warns when an account could not be read', async () => {
        getAssetListSpy.mockResolvedValue(
            buildResponse({
                coverage: [buildCoverage(WorkspaceCoverageStatus.UNAVAILABLE)],
                partial: true,
            }),
        );
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceAssetList\.unavailable\.title$/),
        ).toBeInTheDocument();
    });

    it('does not warn for an unverified account, which is the permanent state of every non indexed account', async () => {
        getAssetListSpy.mockResolvedValue(
            buildResponse({
                coverage: [buildCoverage(WorkspaceCoverageStatus.UNVERIFIED)],
                partial: true,
            }),
        );
        render(createTestComponent());

        // Wait for the response to reach the component, otherwise the absence below is asserted on an empty tree.
        // The plain empty-state heading also proves the coverage was not treated as a failed read.
        expect(
            await screen.findByText(/workspaceAssetList\.emptyState\.heading$/),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/workspaceAssetList\.unavailable\.title$/),
        ).not.toBeInTheDocument();
    });
});
