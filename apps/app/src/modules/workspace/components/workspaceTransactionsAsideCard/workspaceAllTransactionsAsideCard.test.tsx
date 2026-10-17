import {
    DateFormat,
    formatterUtils,
    GukModulesProvider,
} from '@aragon/gov-ui-kit';
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
import {
    generateWorkspaceQueryResponse,
    generateWorkspaceTransaction,
} from '../../testUtils';
import {
    type IWorkspaceAllTransactionsAsideCardProps,
    WorkspaceAllTransactionsAsideCard,
} from './workspaceAllTransactionsAsideCard';

describe('<WorkspaceAllTransactionsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const useWorkspaceTransactionsSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceTransactions',
    );

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const mockTransactions = (options?: {
        totalRecords?: number;
        blockTimestamp?: number;
        partial?: boolean;
    }) =>
        useWorkspaceTransactionsSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: {
                    pages: [
                        generateWorkspaceQueryResponse({
                            data:
                                options?.blockTimestamp != null
                                    ? [
                                          generateWorkspaceTransaction({
                                              blockTimestamp:
                                                  options.blockTimestamp,
                                          }),
                                      ]
                                    : [],
                            partial: options?.partial ?? false,
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
        props?: Partial<IWorkspaceAllTransactionsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceAllTransactionsAsideCardProps = {
            accounts: [daoAccount, safeAccount],
            pageSize: 20,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAllTransactionsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    // Unfiltered and at the list's own page size, which is what keeps it on the list's query key.
    it('reads the first page of the list for the accounts it is given', () => {
        render(createTestComponent());

        expect(useWorkspaceTransactionsSpy).toHaveBeenLastCalledWith(
            {
                body: {
                    accounts: [
                        { network: daoAccount.network, address: daoAddress },
                        { network: safeAccount.network, address: safeAddress },
                    ],
                    filters: {},
                    pagination: { pageSize: 20 },
                },
            },
            { enabled: true },
        );
    });

    it('reads only the account it is given under an account scope', () => {
        render(createTestComponent({ accounts: [safeAccount] }));

        expect(useWorkspaceTransactionsSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({
                    accounts: [
                        { network: safeAccount.network, address: safeAddress },
                    ],
                }),
            }),
            { enabled: true },
        );
    });

    it('disables the request when it is given no account', () => {
        render(createTestComponent({ accounts: [] }));

        expect(useWorkspaceTransactionsSpy).toHaveBeenLastCalledWith(
            expect.anything(),
            { enabled: false },
        );
    });

    it('displays the transaction count and the last activity as stats', () => {
        mockTransactions({ totalRecords: 12 });
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTransactionsAsideCard\.transactions$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceTransactionsAsideCard\.lastActivity$/),
        ).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('titles the card generically when given no title', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                /workspaceTransactionsAsideCard\.allTransactions$/,
            ),
        ).toBeInTheDocument();
    });

    it('titles the card with the given title', () => {
        render(createTestComponent({ title: 'Grants Safe' }));

        expect(screen.getByText('Grants Safe')).toBeInTheDocument();
        expect(
            screen.queryByText(
                /workspaceTransactionsAsideCard\.allTransactions$/,
            ),
        ).not.toBeInTheDocument();
    });

    it('formats the last activity relatively to now', () => {
        const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
        mockTransactions({ totalRecords: 1, blockTimestamp: oneDayAgo });
        render(createTestComponent());

        const expected = formatterUtils.formatDate(oneDayAgo * 1000, {
            format: DateFormat.RELATIVE,
        });
        expect(screen.getByText(expected as string)).toBeInTheDocument();
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

    it('marks the count as a lower bound when the selection is partial', () => {
        mockTransactions({ totalRecords: 12, partial: true });
        render(createTestComponent());

        expect(screen.getByText('12+')).toBeInTheDocument();
    });
});
