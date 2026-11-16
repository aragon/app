import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as financeService from '@/modules/finance/api/financeService';
import { TransactionSide } from '@/modules/finance/api/financeService';
import { generateTransaction } from '@/modules/finance/testUtils';
import * as useNormalizedProposalActions from '@/modules/governance/hooks/useNormalizedProposalActions';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultError,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    type ITransactionExecutionDetailsProps,
    TransactionExecutionDetails,
} from './transactionExecutionDetails';

describe('<TransactionExecutionDetails /> component', () => {
    const useTransactionActionsSpy = jest.spyOn(
        financeService,
        'useTransactionActions',
    );
    const useNormalizedProposalActionsSpy = jest.spyOn(
        useNormalizedProposalActions,
        'useNormalizedProposalActions',
    );

    const mockActions = (
        data?: Partial<financeService.ITransactionActionsResult>,
    ) =>
        useTransactionActionsSpy.mockReturnValue(
            generateReactQueryResultSuccess<
                financeService.ITransactionActionsResult,
                Error
            >({
                data: {
                    actionCount: 0,
                    actions: [],
                    blockTimestamp: 1_700_000_000,
                    decoding: false,
                    transactionHash: '0xabc',
                    ...data,
                },
            }),
        );

    beforeEach(() => {
        mockActions();
        useNormalizedProposalActionsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useTransactionActionsSpy.mockReset();
        useNormalizedProposalActionsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ITransactionExecutionDetailsProps>,
    ) => {
        const completeProps: ITransactionExecutionDetailsProps = {
            dao: generateDao(),
            transaction: generateTransaction({
                side: TransactionSide.EXECUTION,
            }),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TransactionExecutionDetails {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('requests the actions of the transaction', () => {
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            id: 'transaction-id',
            network: Network.ETHEREUM_SEPOLIA,
        });

        render(createTestComponent({ transaction }));

        expect(useTransactionActionsSpy).toHaveBeenCalledWith(
            {
                urlParams: {
                    id: 'transaction-id',
                    network: Network.ETHEREUM_SEPOLIA,
                },
            },
            { refetchInterval: expect.any(Function) },
        );
    });

    it('links the proposal the execution comes from', () => {
        const dao = generateDao({
            address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
            network: Network.ETHEREUM_SEPOLIA,
        });
        mockActions({ proposalSlug: 'multisig-3' });

        render(createTestComponent({ dao }));

        expect(screen.getByText('Proposal')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /MULTISIG-3/ }),
        ).toHaveAttribute(
            'href',
            expect.stringContaining('/proposals/multisig-3'),
        );
    });

    it('renders the data of the transaction while its actions are loading', () => {
        useTransactionActionsSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof financeService.useTransactionActions
            >,
        );
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            actionCount: 4,
        });

        render(createTestComponent({ transaction }));

        expect(screen.getByText('Total actions')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.queryByText('Proposal')).not.toBeInTheDocument();
    });

    it('describes the executor with the version of the plugin that emitted the execution', () => {
        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.MULTISIG,
            subdomain: 'multisig',
            release: '1',
            build: '3',
        });
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            source: 'multisig',
        });

        render(
            createTestComponent({
                dao: generateDao({ plugins: [plugin] }),
                transaction,
            }),
        );

        expect(
            screen.getByText(
                'app.shared.daoPluginInfo.pluginVersionInfo (name=Multisig,release=1,build=3)',
            ),
        ).toBeInTheDocument();
    });

    it('decodes the actions in the context of the DAO', () => {
        const dao = generateDao({ id: 'dao-id' });

        render(createTestComponent({ dao }));

        expect(useNormalizedProposalActionsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ daoId: 'dao-id' }),
        );
    });

    it('reports the actions as not loaded when they could not be read', () => {
        useTransactionActionsSpy.mockReturnValue(
            generateReactQueryResultError({
                error: new Error('error'),
            }) as ReturnType<typeof financeService.useTransactionActions>,
        );

        render(createTestComponent());

        expect(
            screen.getByText(/transactionExecutionActions.loadError/),
        ).toBeInTheDocument();
    });

    it('keeps the actions already read when a later read fails', () => {
        useTransactionActionsSpy.mockReturnValue({
            ...generateReactQueryResultSuccess<
                financeService.ITransactionActionsResult,
                Error
            >({
                data: {
                    actionCount: 0,
                    actions: [],
                    blockTimestamp: 1_700_000_000,
                    decoding: true,
                    transactionHash: '0xabc',
                },
            }),
            error: new Error('error'),
            isError: true,
            isRefetchError: true,
            isSuccess: false,
            status: 'error',
        });

        render(createTestComponent());

        expect(
            screen.queryByText(/transactionExecutionActions.loadError/),
        ).not.toBeInTheDocument();
    });
});
