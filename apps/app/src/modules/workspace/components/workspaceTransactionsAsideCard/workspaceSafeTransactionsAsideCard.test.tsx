import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultLoading,
} from '@/shared/testUtils';
import * as workspaceQueryService from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { generateWorkspaceQueryResponse } from '../../testUtils';
import {
    type IWorkspaceSafeTransactionsAsideCardProps,
    WorkspaceSafeTransactionsAsideCard,
} from './workspaceSafeTransactionsAsideCard';

describe('<WorkspaceSafeTransactionsAsideCard /> component', () => {
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const useWorkspaceTransactionsSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceTransactions',
    );

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
        metadata: { name: 'Grants Safe' },
    };

    const mockTransactions = (options?: {
        totalRecords?: number;
        coverageStatus?: workspaceQueryService.WorkspaceCoverageStatus;
    }) =>
        useWorkspaceTransactionsSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: {
                    pages: [
                        generateWorkspaceQueryResponse({
                            data: [],
                            coverage: options?.coverageStatus
                                ? [
                                      {
                                          account: {
                                              network: safeAccount.network,
                                              address: safeAccount.address,
                                          },
                                          resource: 'transactions',
                                          source: workspaceQueryService
                                              .WorkspaceCoverageSource.SAFE,
                                          status: options.coverageStatus,
                                      },
                                  ]
                                : [],
                            metadata: generatePaginatedResponseMetadata({
                                totalRecords: options?.totalRecords ?? 0,
                            }),
                        }),
                    ],
                    pageParams: [],
                },
            }) as unknown as ReturnType<
                typeof workspaceQueryService.useWorkspaceTransactions
            >,
        );

    beforeEach(() => {
        mockTransactions();
    });

    afterEach(() => {
        useWorkspaceTransactionsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceSafeTransactionsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceSafeTransactionsAsideCardProps = {
            account: safeAccount,
            label: 'Grants Safe',
            pageSize: 20,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceSafeTransactionsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    // Unfiltered and at the list's own page size, which is what keeps it on the list's query key.
    it('reads the first page of the list for the Safe', () => {
        render(createTestComponent());

        expect(useWorkspaceTransactionsSpy).toHaveBeenLastCalledWith(
            {
                body: {
                    accounts: [
                        { network: safeAccount.network, address: safeAddress },
                    ],
                    filters: {},
                    pagination: { pageSize: 20 },
                },
            },
            { enabled: true },
        );
    });

    it('renders the Safe card titled by the label with the transaction stats', () => {
        mockTransactions({ totalRecords: 12 });
        render(createTestComponent());

        expect(screen.getByText('Grants Safe')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceTransactionsAsideCard\.transactions$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceTransactionsAsideCard\.lastActivity$/),
        ).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('falls back to a placeholder while the transactions are loading', () => {
        useWorkspaceTransactionsSpy.mockReturnValue(
            generateReactQueryResultLoading() as unknown as ReturnType<
                typeof workspaceQueryService.useWorkspaceTransactions
            >,
        );
        render(createTestComponent());

        expect(screen.getAllByText('-')).toHaveLength(2);
    });

    it('renders a lower-bound count when the Safe holds more than was read', () => {
        mockTransactions({
            totalRecords: 12,
            coverageStatus:
                workspaceQueryService.WorkspaceCoverageStatus.PARTIAL,
        });
        render(createTestComponent());

        expect(screen.getByText('12+')).toBeInTheDocument();
    });
});
