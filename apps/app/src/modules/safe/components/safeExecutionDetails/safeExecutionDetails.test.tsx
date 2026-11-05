import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { TransactionSide } from '@/modules/finance/api/financeService';
import * as transactionExecutionActions from '@/modules/finance/components/transactionExecutionActions';
import { generateTransaction } from '@/modules/finance/testUtils';
import { Network } from '@/shared/api/daoService';
import * as safeService from '@/shared/api/safeService';
import {
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    type ISafeExecutionDetailsProps,
    SafeExecutionDetails,
} from './safeExecutionDetails';

describe('<SafeExecutionDetails /> component', () => {
    const useSafeTransactionActionsSpy = jest.spyOn(
        safeService,
        'useSafeTransactionActions',
    );
    const transactionExecutionActionsSpy = jest.spyOn(
        transactionExecutionActions,
        'TransactionExecutionActions',
    );

    const safeAddress = '0xeB88A1D01306Bd9d8442673ee78770f2665B008F';
    const to = '0xE5e5f0c2e1B5F1b8f2C0a1D3a4B5c6D7e8F90123';

    const mockActions = (data?: Partial<safeService.ISafeTransactionActions>) =>
        useSafeTransactionActionsSpy.mockReturnValue(
            generateReactQueryResultSuccess<
                safeService.ISafeTransactionActions,
                Error
            >({
                data: {
                    decoding: false,
                    actions: [],
                    rawActions: [],
                    ...data,
                },
            }),
        );

    beforeEach(() => {
        mockActions();
        transactionExecutionActionsSpy.mockReturnValue(
            <div data-testid="execution-actions" />,
        );
    });

    afterEach(() => {
        useSafeTransactionActionsSpy.mockReset();
        transactionExecutionActionsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeExecutionDetailsProps>,
    ) => {
        const completeProps: ISafeExecutionDetailsProps = {
            transaction: generateTransaction({
                side: TransactionSide.EXECUTION,
            }),
            safeAddress,
            safeTxHash: '0xff54',
            ...props,
        };

        return (
            <GukModulesProvider>
                <SafeExecutionDetails {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('requests the actions of the Safe transaction', () => {
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            network: Network.ETHEREUM_SEPOLIA,
        });

        render(createTestComponent({ transaction }));

        expect(useSafeTransactionActionsSpy).toHaveBeenCalledWith(
            {
                urlParams: {
                    network: Network.ETHEREUM_SEPOLIA,
                    address: safeAddress,
                    safeTxHash: '0xff54',
                },
            },
            { refetchInterval: expect.any(Function) },
        );
    });

    it('renders the executor and no proposal', () => {
        const fromAddress = '0x6818013d7B2D49D7396BA9733b59C539A639f3ED';
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            fromAddress,
        });

        render(createTestComponent({ transaction }));

        expect(screen.getByText('Executed by')).toBeInTheDocument();
        expect(screen.queryByText('Proposal')).not.toBeInTheDocument();
    });

    it('renders only the actions of a pending Safe transaction, which has no onchain execution yet', () => {
        const transaction = {
            ...generateTransaction({ side: TransactionSide.EXECUTION }),
            transactionHash: null,
            blockTimestamp: null,
        };

        render(createTestComponent({ transaction }));

        expect(screen.queryByText('Executed by')).not.toBeInTheDocument();
        expect(screen.getByTestId('execution-actions')).toBeInTheDocument();
    });

    it('attributes the raw calls to the Safe while the actions are being decoded', () => {
        mockActions({
            decoding: true,
            rawActions: [{ to, data: '0x1234', value: '5' }],
        });

        render(createTestComponent());

        expect(transactionExecutionActionsSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                actionCount: 1,
                actions: [expect.objectContaining({ from: safeAddress, to })],
                isLoading: false,
            }),
            undefined,
        );
    });

    it('falls back to the action count of the transaction while the actions are loading', () => {
        useSafeTransactionActionsSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeService.useSafeTransactionActions
            >,
        );
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            actionCount: 4,
        });

        render(createTestComponent({ transaction }));

        expect(screen.getByText('4')).toBeInTheDocument();
        expect(transactionExecutionActionsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ actionCount: 4, isLoading: true }),
            undefined,
        );
    });
});
