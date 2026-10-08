import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoFilterAsideCard from '@/modules/finance/components/daoFilterAsideCard';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
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
    type IWorkspaceDaoTransactionsAsideCardProps,
    WorkspaceDaoTransactionsAsideCard,
} from './workspaceDaoTransactionsAsideCard';

describe('<WorkspaceDaoTransactionsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const useWorkspaceTransactionsSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceTransactions',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const daoFilterAsideCardSpy = jest.spyOn(
        daoFilterAsideCard,
        'DaoFilterAsideCard',
    );

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const firstTransaction = generateWorkspaceTransaction({
        blockTimestamp: 1_700_000_000,
    });

    const mockTransactions = () =>
        useWorkspaceTransactionsSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: {
                    pages: [
                        generateWorkspaceQueryResponse({
                            data: [firstTransaction],
                            metadata: generatePaginatedResponseMetadata({
                                totalRecords: 7,
                            }),
                        }),
                    ],
                    pageParams: [],
                },
            }) as unknown as ReturnType<
                typeof workspaceQueryService.useWorkspaceTransactions
            >,
        );

    const dao = generateDao({
        id: daoAccount.id,
        network: Network.ETHEREUM_SEPOLIA,
    });

    beforeEach(() => {
        mockTransactions();
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        daoFilterAsideCardSpy.mockImplementation(() => (
            <div data-testid="dao-filter-aside-mock" />
        ));
    });

    afterEach(() => {
        useWorkspaceTransactionsSpy.mockReset();
        useDaoSpy.mockReset();
        daoFilterAsideCardSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceDaoTransactionsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceDaoTransactionsAsideCardProps = {
            account: daoAccount,
            label: 'Demo DAO',
            pageSize: 20,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceDaoTransactionsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    // A workspace account ID is already the DAO ID, so this shares its key with the DAO pages' own query.
    it('reads the DAO of the account and renders its transactions card as the parent-DAO view', () => {
        render(createTestComponent());

        expect(useDaoSpy).toHaveBeenLastCalledWith({
            urlParams: { id: daoAccount.id },
        });
        expect(screen.getByTestId('dao-filter-aside-mock')).toBeInTheDocument();
        expect(daoFilterAsideCardSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                dao,
                statsType: 'transactions',
                activeOption: {
                    id: dao.id,
                    label: 'Demo DAO',
                    daoId: dao.id,
                    isAll: false,
                    isParent: true,
                },
            }),
            undefined,
        );
    });

    it('reads the first page of the list for the account alone', () => {
        render(createTestComponent());

        expect(useWorkspaceTransactionsSpy).toHaveBeenLastCalledWith({
            body: {
                accounts: [
                    { network: daoAccount.network, address: daoAddress },
                ],
                filters: {},
                pagination: { pageSize: 20 },
            },
        });
    });

    // The transaction stats read the most recent row out of `data`, unlike the asset ones, which only count
    // records — so an empty `data` would leave the last-activity stat blank.
    it('hands the whole first page to the card, rows included', () => {
        render(createTestComponent());

        expect(daoFilterAsideCardSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                selectedMetadata: expect.objectContaining({
                    data: [firstTransaction],
                    metadata: expect.objectContaining({ totalRecords: 7 }),
                }),
            }),
            undefined,
        );
    });

    // The DAO is pending on first paint and its read fails outright for an account the backend no longer indexes.
    // The plain totals still describe the account, so the aside keeps them rather than leaving the column blank.
    it('falls back to the totals card titled after the account while the DAO is unavailable', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof daoService.useDao
            >,
        );
        render(createTestComponent());

        expect(
            screen.queryByTestId('dao-filter-aside-mock'),
        ).not.toBeInTheDocument();
        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
    });
});
