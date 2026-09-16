import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    concatHex,
    encodeFunctionData,
    encodePacked,
    erc20Abi,
    getAddress,
    type Hex,
    hashTypedData,
    size,
} from 'viem';
import * as Wagmi from 'wagmi';
import locales from '@/assets/locales/en.json';
import { smartContractService } from '@/modules/governance/api/smartContractService';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDialogContext,
    generateSafeTransaction,
} from '@/shared/testUtils';
import {
    safeMultiSendAbi,
    safeTransactionEnvelopeUtils,
} from '../../utils/safeTransactionEnvelopeUtils';
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
    const useBytecodeSpy = jest.spyOn(Wagmi, 'useBytecode');
    const useReadContractSpy = jest.spyOn(Wagmi, 'useReadContract');

    const safeAddress = getAddress(
        '0x5afe000000000000000000000000000000000001',
    );
    const target = getAddress('0x1111111111111111111111111111111111111111');
    const zeroAddress = getAddress(
        '0x0000000000000000000000000000000000000000',
    );

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        // Default to an unresolved read: an unanswered node must not accuse a valid batch.
        useBytecodeSpy.mockReturnValue({
            data: undefined,
            isSuccess: false,
        } as never);
        // The dialog hashes under the version it reads from the Safe, never the reported one.
        useReadContractSpy.mockReturnValue({ data: '1.4.1' } as never);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useBytecodeSpy.mockReset();
        useReadContractSpy.mockReset();
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
        to?: Hex;
    }) => {
        const fields = {
            to: overrides?.to ?? target,
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

    /**
     * Observed on sepolia: a delegate call to an address holding no code consumed nonce 6 of the
     * gate Safe, emitted `ExecutionSuccess`, and ran none of its inner calls. Every other signal
     * on this dialog looked correct - the hash verified and the payload decoded - so the missing
     * code at the target is the only thing that distinguishes it from a batch that works.
     */
    it.each([
        { code: undefined, label: 'no code' },
        { code: '0x' as Hex, label: 'empty code' },
    ])(
        'warns that a delegate call to a target with $label will run nothing',
        ({ code }) => {
            useBytecodeSpy.mockReturnValue({
                data: code,
                isSuccess: true,
            } as never);

            render(
                createTestComponent({
                    transaction: generateSignedTransaction({ operation: 1 }),
                }),
            );

            expect(
                screen.getByText(
                    'app.safe.safeTransactionReviewDialog.codelessDelegateCall',
                ),
            ).toBeInTheDocument();
        },
    );

    it('does not warn when the delegate call target holds code', () => {
        useBytecodeSpy.mockReturnValue({
            data: '0x6080604052' as Hex,
            isSuccess: true,
        } as never);

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 1 }),
            }),
        );

        expect(
            screen.queryByText(
                'app.safe.safeTransactionReviewDialog.codelessDelegateCall',
            ),
        ).not.toBeInTheDocument();
    });

    it('stays silent while the target read is unresolved', () => {
        // An unanswered or failed node read is not evidence of an empty target. Warning on it
        // would tell an owner not to sign a batch that is sound, on the strength of nothing.
        useBytecodeSpy.mockReturnValue({
            data: undefined,
            isSuccess: false,
        } as never);

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 1 }),
            }),
        );

        expect(
            screen.queryByText(
                'app.safe.safeTransactionReviewDialog.codelessDelegateCall',
            ),
        ).not.toBeInTheDocument();
    });

    it('does not warn about a plain call to an address with no code', () => {
        // A call to a codeless address wastes its own slot; it does not void the other calls, and
        // only the Safe's own context - which delegatecall hands over - can be voided wholesale.
        useBytecodeSpy.mockReturnValue({
            data: undefined,
            isSuccess: true,
        } as never);

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 0 }),
            }),
        );

        expect(
            screen.queryByText(
                'app.safe.safeTransactionReviewDialog.codelessDelegateCall',
            ),
        ).not.toBeInTheDocument();
    });

    /**
     * The signal that needs no network: a delegate call executes in the Safe's own context, so an
     * unrecognised target can rewrite owners, threshold or the code the Safe runs. Unlike the
     * bytecode read this holds while the chain is unreachable, and for a target that has code.
     */
    it('warns that a delegate call target is not a known batching contract', () => {
        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 1 }),
            }),
        );

        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.unrecognisedDelegateCall',
            ),
        ).toBeInTheDocument();
    });

    it('accepts a delegate call to the canonical MultiSend without comment', () => {
        render(
            createTestComponent({
                transaction: generateSignedTransaction({
                    operation: 1,
                    to: getAddress(
                        '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526',
                    ),
                }),
            }),
        );

        expect(
            screen.queryByText(
                'app.safe.safeTransactionReviewDialog.unrecognisedDelegateCall',
            ),
        ).not.toBeInTheDocument();
    });

    it('does not call an ordinary call an unrecognised delegate call', () => {
        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 0 }),
            }),
        );

        expect(
            screen.queryByText(
                'app.safe.safeTransactionReviewDialog.unrecognisedDelegateCall',
            ),
        ).not.toBeInTheDocument();
    });

    it('warns about a delegate call nested inside an otherwise canonical batch', () => {
        // The outer target is the real MultiSend, so an outer-only check sees nothing wrong. The
        // inner entry carries operation byte 1 into an unrecognised address, which hands the
        // Safe's context to it just as effectively.
        const innerData = '0x1234' as Hex;
        const data = encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [
                encodePacked(
                    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
                    [1, target, BigInt(0), BigInt(size(innerData)), innerData],
                ),
            ],
        });

        render(
            createTestComponent({
                transaction: generateSignedTransaction({
                    data,
                    operation: 1,
                    to: getAddress(
                        '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526',
                    ),
                }),
            }),
        );

        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.unrecognisedDelegateCall',
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

    it('refuses to confirm a truncated batch, because the listed calls understate it', async () => {
        const onConfirm = jest.fn();
        const data = encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [
                concatHex([
                    encodePacked(
                        ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
                        [0, target as Hex, BigInt(0), BigInt(32), '0xab'],
                    ),
                ]),
            ],
        });

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ data }),
                onConfirm,
            }),
        );

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('refuses to confirm a delegate call to a codeless target, which would run none of the calls', async () => {
        const onConfirm = jest.fn();
        useBytecodeSpy.mockReturnValue({
            data: undefined,
            isSuccess: true,
        } as never);

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 1 }),
                onConfirm,
            }),
        );

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('still allows confirming when the hash merely could not be recomputed', async () => {
        // Honest about itself: the fields are shown either way, so refusing here would lock owners
        // out of a legitimate payload without making anything safer.
        const onConfirm = jest.fn();
        useReadContractSpy.mockReturnValue({ data: undefined } as never);
        render(createTestComponent({ onConfirm }));

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onConfirm).toHaveBeenCalled();
    });

    it('refuses to confirm a delegate call while the target bytecode read is unresolved', async () => {
        // The codeless check cannot answer yet, so the gate would otherwise be a race an owner wins
        // by clicking before the node replies. `beforeEach` already leaves the read unresolved.
        const onConfirm = jest.fn();

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 1 }),
                onConfirm,
            }),
        );

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('refuses to confirm a delegate call whose target bytecode read failed', async () => {
        const onConfirm = jest.fn();
        useBytecodeSpy.mockReturnValue({
            data: undefined,
            isSuccess: false,
            isError: true,
        } as never);

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ operation: 1 }),
                onConfirm,
            }),
        );

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onConfirm).not.toHaveBeenCalled();
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
        // Unknown now means the chain read has not answered: the reported version is never a
        // fallback for it.
        useReadContractSpy.mockReturnValue({ data: undefined } as never);
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.hashUnverifiable',
            ),
        ).toBeInTheDocument();
    });

    it('does not claim the hash is unverifiable while the version read is still in flight', async () => {
        // The alert would appear and retract a moment later, which is the worst thing to do to a
        // warning signers are being taught to act on. Confirm stays available: an unchecked hash
        // is not a misdescribed payload.
        const onConfirm = jest.fn();
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isPending: true,
        } as never);
        render(createTestComponent({ onConfirm }));

        expect(
            screen.queryByText(
                'app.safe.safeTransactionReviewDialog.hashUnverifiable',
            ),
        ).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
        expect(onConfirm).toHaveBeenCalled();
    });

    it('labels the transaction hash as service-reported when it could not be recomputed', () => {
        // Otherwise the one locally-derived value on screen silently becomes a backend echo, and
        // the tool a signer is told to check it with fetches the same transaction from the same
        // service by default - the comparison passes and proves nothing.
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isPending: false,
        } as never);
        const transaction = generateSignedTransaction({});
        render(createTestComponent({ transaction }));

        expect(
            screen.getByText(
                'app.safe.safeTransactionReviewDialog.fields.reportedSafeTxHash',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.safe.safeTransactionReviewDialog.fields.safeTxHash',
            ),
        ).not.toBeInTheDocument();
    });

    it('refuses to confirm when the local and remote decoders disagree about a call', async () => {
        // The remote decode arrives from the same backend as the envelope, so a benign label on a
        // hostile call is exactly the case the local set exists to catch.
        const onConfirm = jest.fn();
        const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [target, BigInt(1)],
        });
        jest.spyOn(
            smartContractService,
            'decodeTransactionsLight',
        ).mockResolvedValue([{ inputData: { function: 'approve' } } as never]);

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ data }),
                onConfirm,
            }),
        );

        expect(
            await screen.findByText(
                'app.safe.safeTransactionReviewDialog.decoderDisagreement',
            ),
        ).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('labels a governance call from the local decode, so a backend label cannot rename it', async () => {
        const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [target, BigInt(1)],
        });
        jest.spyOn(
            smartContractService,
            'decodeTransactionsLight',
        ).mockResolvedValue([]);

        render(
            createTestComponent({
                transaction: generateSignedTransaction({ data }),
            }),
        );

        expect(await screen.findByText('transfer')).toBeInTheDocument();
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

        // The outer `multiSend` is now named by the local decode; the two inner calls hold no
        // bundled selector, so they stay unlabelled rather than borrowing the one-entry response.
        expect(
            await screen.findAllByText(
                'app.safe.safeTransactionReviewDialog.unknownAction',
            ),
        ).toHaveLength(2);
        expect(screen.getByText('multiSend')).toBeInTheDocument();
        expect(screen.queryByText('transfer')).not.toBeInTheDocument();

        decodeSpy.mockRestore();
    });

    describe('out-of-band hash comparison', () => {
        it('renders the domain, message and transaction hashes in full, because a truncated hash cannot be checked against a device', () => {
            const transaction = generateSignedTransaction({});
            const { domainHash, messageHash, safeTxHash } =
                safeTransactionEnvelopeUtils.getVerificationHashes({
                    transaction,
                    safeAddress,
                    safeVersion: '1.4.1',
                    chainId: BigInt(1),
                });

            render(createTestComponent({ transaction }));

            for (const hash of [domainHash, messageHash, safeTxHash]) {
                expect(screen.getByText(hash as string)).toBeInTheDocument();
            }
        });

        it('withholds the device hashes for a Safe whose version cannot produce them, rather than showing a hash a device will never match', () => {
            useReadContractSpy.mockReturnValue({ data: '1.1.1' } as never);
            render(createTestComponent({ safeVersion: '1.1.1' }));

            expect(
                screen.queryByText(
                    'app.safe.safeTransactionReviewDialog.fields.domainHash',
                ),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(
                    'app.safe.safeTransactionReviewDialog.fields.messageHash',
                ),
            ).not.toBeInTheDocument();
        });

        it('hashes under the version read from the Safe rather than the one reported with the transaction', () => {
            // A backend that reports a different version would otherwise choose the EIP-712
            // domain the device is asked to match.
            const transaction = generateSignedTransaction({});
            const { domainHash } =
                safeTransactionEnvelopeUtils.getVerificationHashes({
                    transaction,
                    safeAddress,
                    safeVersion: '1.4.1',
                    chainId: BigInt(1),
                });
            useReadContractSpy.mockReturnValue({ data: '1.4.1' } as never);
            render(
                createTestComponent({ transaction, safeVersion: '1.3.0+L2' }),
            );

            expect(screen.getByText(domainHash as string)).toBeInTheDocument();
        });

        it('refuses to confirm when the chain and the service disagree about the version', async () => {
            const onConfirm = jest.fn();
            useReadContractSpy.mockReturnValue({ data: '1.4.1' } as never);
            render(createTestComponent({ safeVersion: '1.3.0', onConfirm }));

            expect(screen.getByText(/versionMismatch/)).toBeInTheDocument();

            await userEvent.click(
                screen.getByRole('button', { name: 'Confirm' }),
            );
            expect(onConfirm).not.toHaveBeenCalled();
        });

        it('treats an L2 build tag as the same version, because the service suffixes what the contract does not', async () => {
            // `1.4.1+L2` from the service against `1.4.1` onchain is every L2 Safe; a strict
            // comparison would refuse signing on all of them.
            const onConfirm = jest.fn();
            useReadContractSpy.mockReturnValue({ data: '1.4.1' } as never);
            render(createTestComponent({ safeVersion: '1.4.1+L2', onConfirm }));

            expect(
                screen.queryByText(/versionMismatch/),
            ).not.toBeInTheDocument();

            await userEvent.click(
                screen.getByRole('button', { name: 'Confirm' }),
            );
            expect(onConfirm).toHaveBeenCalled();
        });

        it('never affirms a payload as verified or safe, because every hash shown is derived from an envelope this app received over the wire', () => {
            render(createTestComponent());

            expect(
                screen.getByText(
                    'app.safe.safeTransactionReviewDialog.hashComparison',
                ),
            ).toBeInTheDocument();

            // Asserted against the copy, not the rendered keys: this suite renders translation
            // keys, so scanning the DOM would only ever search key names. The signing path must
            // carry no affirmation - a compromised frontend renders its own reassurance, so a
            // "verified" state here would be worth exactly nothing and read as everything.
            const copy = JSON.stringify(
                (
                    locales.app.safe as unknown as Record<
                        string,
                        Record<string, unknown>
                    >
                ).safeTransactionReviewDialog,
            );

            // `(?<!un)` deliberately: "unverified" is the *honest* label RFP requirement 5 asks
            // for on undecodable calldata, so this must not push a future dev into weakening it.
            expect(copy).not.toMatch(
                /(?<!un)verified|safe to sign|confirmed safe|✓/i,
            );
        });
    });
});
