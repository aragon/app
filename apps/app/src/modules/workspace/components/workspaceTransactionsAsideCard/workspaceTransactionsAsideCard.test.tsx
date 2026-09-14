import {
    DateFormat,
    formatterUtils,
    GukModulesProvider,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoInfoAside from '@/modules/finance/components/daoInfoAside';
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
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountFilterOption } from '../../hooks/useWorkspaceAccountFilter';
import {
    generateWorkspaceQueryResponse,
    generateWorkspaceTransaction,
} from '../../testUtils';
import {
    type IWorkspaceTransactionsAsideCardProps,
    WorkspaceTransactionsAsideCard,
} from './workspaceTransactionsAsideCard';

describe('<WorkspaceTransactionsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const useWorkspaceTransactionsSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceTransactions',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const daoInfoAsideSpy = jest.spyOn(daoInfoAside, 'DaoInfoAside');

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

    const workspace: IWorkspace = {
        id: 'test-workspace',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        owner: daoAddress,
        accounts: [daoAccount, safeAccount],
        targets: [],
    };

    const daoOption: IWorkspaceAccountFilterOption = {
        id: daoAccount.id,
        label: 'Demo DAO',
        account: daoAccount,
        isAllAccounts: false,
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
        useDaoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof daoService.useDao
            >,
        );
        daoInfoAsideSpy.mockImplementation(() => (
            <div data-testid="dao-info-mock" />
        ));
    });

    afterEach(() => {
        useWorkspaceTransactionsSpy.mockReset();
        useDaoSpy.mockReset();
        daoInfoAsideSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTransactionsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceTransactionsAsideCardProps = {
            workspace,
            pageSize: 20,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTransactionsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('reads the first page of the list for every workspace account when no account is selected', () => {
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
        expect(useDaoSpy).toHaveBeenLastCalledWith(expect.anything(), {
            enabled: false,
        });
    });

    it('titles the card generically and renders the stats on their own when no account is selected', () => {
        mockTransactions({ totalRecords: 12 });
        render(createTestComponent());

        expect(
            screen.getByText(
                /workspaceTransactionsAsideCard\.allTransactions$/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceTransactionsAsideCard\.transactions$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceTransactionsAsideCard\.lastActivity$/),
        ).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.queryByTestId('dao-info-mock')).not.toBeInTheDocument();
    });

    it('treats the aggregated option like no selection', () => {
        render(
            createTestComponent({
                activeOption: {
                    id: 'all',
                    label: 'All accounts',
                    isAllAccounts: true,
                },
            }),
        );

        expect(
            screen.getByText(
                /workspaceTransactionsAsideCard\.allTransactions$/,
            ),
        ).toBeInTheDocument();
        expect(screen.queryByText('All accounts')).not.toBeInTheDocument();
        expect(screen.queryByTestId('dao-info-mock')).not.toBeInTheDocument();
    });

    it('narrows the stats to the selected account and reads its DAO', () => {
        render(createTestComponent({ activeOption: daoOption }));

        expect(useWorkspaceTransactionsSpy).toHaveBeenLastCalledWith(
            {
                body: {
                    accounts: [
                        { network: daoAccount.network, address: daoAddress },
                    ],
                    filters: {},
                    pagination: { pageSize: 20 },
                },
            },
            { enabled: true },
        );
        expect(useDaoSpy).toHaveBeenLastCalledWith(
            { urlParams: { id: daoAccount.id } },
            { enabled: true },
        );
    });

    it('titles the card after the selected account and renders the DAO metadata once loaded', () => {
        const dao = generateDao({
            id: daoAccount.id,
            network: Network.ETHEREUM_SEPOLIA,
        });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        render(createTestComponent({ activeOption: daoOption }));

        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
        expect(screen.getByTestId('dao-info-mock')).toBeInTheDocument();
        expect(daoInfoAsideSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                dao,
                daoId: daoAccount.id,
                network: Network.ETHEREUM_SEPOLIA,
            }),
            undefined,
        );
    });

    it('renders the stats on their own while the DAO of the selected account is loading', () => {
        mockTransactions({ totalRecords: 12 });
        render(createTestComponent({ activeOption: daoOption }));

        expect(screen.getByText('12')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceTransactionsAsideCard\.transactions$/),
        ).toBeInTheDocument();
        expect(screen.queryByTestId('dao-info-mock')).not.toBeInTheDocument();
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
