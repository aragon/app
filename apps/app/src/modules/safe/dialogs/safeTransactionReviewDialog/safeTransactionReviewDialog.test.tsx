import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    concatHex,
    encodeFunctionData,
    encodePacked,
    getAddress,
    type Hex,
    hashTypedData,
    size,
} from 'viem';
import { smartContractService } from '@/modules/governance/api/smartContractService';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDialogContext,
    generateSafeTransaction,
} from '@/shared/testUtils';
import { safeMultiSendAbi } from '../../utils/safeTransactionEnvelopeUtils';
import {
    type ISafeTransactionReviewDialogParams,
    SafeTransactionReviewDialog,
} from './safeTransactionReviewDialog';

jest.mock('@aragon/gov-ui-kit', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const Dialog = {
        Header: (props: { title: string }) => <h2>{props.title}</h2>,
        Content: (props: {
            description?: string;
            children?: React.ReactNode;
        }) => (
            <div>
                <p>{props.description}</p>
                {props.children}
            </div>
        ),
        Footer: (props: {
            primaryAction: {
                label: string;
                disabled?: boolean;
                onClick?: () => void;
            };
            secondaryAction?: { label: string; onClick?: () => void };
        }) => (
            <div>
                {props.secondaryAction != null && (
                    <button
                        onClick={props.secondaryAction.onClick}
                        type="button"
                    >
                        {props.secondaryAction.label}
                    </button>
                )}
                <button
                    disabled={props.primaryAction.disabled}
                    onClick={props.primaryAction.onClick}
                    type="button"
                >
                    {props.primaryAction.label}
                </button>
            </div>
        ),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...actual, Dialog };
});

describe('<SafeTransactionReviewDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const safeAddress = getAddress(
        '0x5afe000000000000000000000000000000000001',
    );
    const target = getAddress('0x1111111111111111111111111111111111111111');
    const zeroAddress = getAddress(
        '0x0000000000000000000000000000000000000000',
    );

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    /**
     * Hash of the EIP-712 `SafeTx` struct for mainnet, so a fixture can carry the hash its fields
     * actually produce.
     */
    const hashSafeTx = (transaction: {
        to: string;
        value: string;
        data: string;
        operation: number;
        safeTxGas: string;
        baseGas: string;
        gasPrice: string;
        gasToken: string;
        refundReceiver: string;
        nonce: string;
    }) =>
        hashTypedData({
            domain: { chainId: 1, verifyingContract: safeAddress },
            types: {
                SafeTx: [
                    { name: 'to', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'data', type: 'bytes' },
                    { name: 'operation', type: 'uint8' },
                    { name: 'safeTxGas', type: 'uint256' },
                    { name: 'baseGas', type: 'uint256' },
                    { name: 'gasPrice', type: 'uint256' },
                    { name: 'gasToken', type: 'address' },
                    { name: 'refundReceiver', type: 'address' },
                    { name: 'nonce', type: 'uint256' },
                ],
            },
            primaryType: 'SafeTx',
            message: {
                to: transaction.to as Hex,
                value: BigInt(transaction.value),
                data: transaction.data as Hex,
                operation: transaction.operation,
                safeTxGas: BigInt(transaction.safeTxGas),
                baseGas: BigInt(transaction.baseGas),
                gasPrice: BigInt(transaction.gasPrice),
                gasToken: transaction.gasToken as Hex,
                refundReceiver: transaction.refundReceiver as Hex,
                nonce: BigInt(transaction.nonce),
            },
        });

    const generateSignedTransaction = (overrides?: {
        data?: string;
        operation?: 0 | 1;
    }) => {
        const fields = {
            to: target,
            value: '0',
            data: overrides?.data ?? '0xdeadbeef',
            operation: overrides?.operation ?? (0 as const),
            safeTxGas: '0',
            baseGas: '0',
            gasPrice: '0',
            gasToken: zeroAddress,
            refundReceiver: zeroAddress,
            nonce: '7',
        };

        return generateSafeTransaction({
            ...fields,
            safeTxHash: hashSafeTx(fields),
        });
    };

    const createTestComponent = (
        params?: Partial<ISafeTransactionReviewDialogParams>,
    ) => {
        const completeParams: ISafeTransactionReviewDialogParams = {
            transaction: generateSignedTransaction(),
            safeAddress,
            network: Network.ETHEREUM_MAINNET,
            safeVersion: '1.4.1',
            confirmLabel: 'Confirm',
            onConfirm: jest.fn(),
            ...params,
        };

        return (
            <QueryClientProvider client={new QueryClient()}>
                <GukModulesProvider>
                    <SafeTransactionReviewDialog
                        location={{
                            id: 'safe-transaction-review',
                            params: completeParams,
                        }}
                    />
                </GukModulesProvider>
            </QueryClientProvider>
        );
    };

    it('shows the signed envelope fields and the raw calldata that will execute', () => {
        render(createTestComponent());

        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('0xdeadbeef')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.operation.call',
            ),
        ).toBeInTheDocument();
    });

    it('names a delegate call rather than showing it as an ordinary call', () => {
        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 1 }),
            }),
        );

        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.operation.delegateCall',
            ),
        ).toBeInTheDocument();
    });

    it('lists every call of a batch so an extra effect cannot hide behind the first', () => {
        const packedCalls = [
            { to: target, data: '0x1234' as Hex },
            { to: safeAddress, data: '0xabcd' as Hex },
        ].map(({ to, data }) =>
            encodePacked(
                ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
                [0, to as Hex, BigInt(0), BigInt(size(data)), data],
            ),
        );
        const data = encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [concatHex(packedCalls)],
        });

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ data }),
            }),
        );

        expect(screen.getByText('0x1234')).toBeInTheDocument();
        expect(screen.getByText('0xabcd')).toBeInTheDocument();
    });

    it('warns that the calls are not the whole transaction when a batch is truncated', () => {
        const data = encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [
                concatHex([
                    encodePacked(
                        ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
                        [
                            0,
                            target as Hex,
                            BigInt(0),
                            // Declares more calldata than the payload carries.
                            BigInt(32),
                            '0xab',
                        ],
                    ),
                ]),
            ],
        });

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ data }),
            }),
        );

        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.incompleteBatch',
            ),
        ).toBeInTheDocument();
    });

    it('refuses to confirm a transaction whose fields do not match its hash', async () => {
        const onConfirm = jest.fn();
        const transaction = generateSafeTransaction({
            to: target,
            value: '0',
            data: '0xdeadbeef',
            nonce: '7',
            safeTxHash: '0xnotthehashofthesefields',
        });

        render(createTestComponent({ transaction, onConfirm }));

        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.hashMismatch',
            ),
        ).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('authorises the reviewed payload when the owner confirms', async () => {
        const onConfirm = jest.fn();
        render(createTestComponent({ onConfirm }));

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onConfirm).toHaveBeenCalled();
    });

    it('says the hash could not be checked rather than claiming a mismatch', () => {
        render(createTestComponent({ safeVersion: null }));

        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.hashUnverifiable',
            ),
        ).toBeInTheDocument();
    });

    it('labels nothing when the decode response does not line up with the calls', async () => {
        // Decoded actions are matched by position, so a short response would otherwise put one
        // call's function name on another inside a surface the owner authorises from.
        // One decoded action for three calls: without the length guard the first row would be
        // labelled `transfer` from a response that says nothing about it.
        const decodeSpy = jest
            .spyOn(smartContractService, 'decodeTransactionsLight')
            .mockResolvedValue([
                {
                    from: '',
                    to: target,
                    data: '0x1234',
                    value: '0',
                    type: 'Transfer',
                    inputData: {
                        function: 'transfer',
                        contract: 'Token',
                        parameters: [],
                    },
                } as never,
            ]);
        const data = encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [
                concatHex(
                    [
                        { to: target, data: '0x1234' as Hex },
                        { to: safeAddress, data: '0xabcd' as Hex },
                    ].map(({ to, data: callData }) =>
                        encodePacked(
                            ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
                            [
                                0,
                                to as Hex,
                                BigInt(0),
                                BigInt(size(callData)),
                                callData,
                            ],
                        ),
                    ),
                ),
            ],
        });

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ data }),
            }),
        );

        expect(
            await screen.findAllByText(
                'app.safe.safeTransactionReviewDialog.unknownAction',
            ),
        ).toHaveLength(3);
        expect(screen.queryByText('transfer')).not.toBeInTheDocument();

        decodeSpy.mockRestore();
    });
});
