import {
    concatHex,
    encodeFunctionData,
    encodePacked,
    getAddress,
    type Hex,
    hashTypedData,
    size,
} from 'viem';
import { generateSafeTransaction } from '@/shared/testUtils';
import { safeMultiSendAbi } from './safeMultiSendAbi';
import {
    SafeBatchStatus,
    SafeHashVerification,
    safeTransactionEnvelopeUtils,
} from './safeTransactionEnvelopeUtils';

describe('safeTransactionEnvelope utils', () => {
    const safeAddress = getAddress(
        '0x5afe000000000000000000000000000000000001',
    );
    const target = getAddress('0x1111111111111111111111111111111111111111');
    const zeroAddress = getAddress(
        '0x0000000000000000000000000000000000000000',
    );
    const chainId = BigInt(1);
    const safeVersion = '1.4.1';

    /**
     * Independent hash of the EIP-712 `SafeTx` struct, so the assertion does not simply replay the
     * helper the utility calls.
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
            domain: {
                chainId: Number(chainId),
                verifyingContract: safeAddress,
            },
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

    const encodeBatch = (...packedCalls: Hex[]) =>
        encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [concatHex(packedCalls)],
        });

    const packCall = (params: {
        to: string;
        data: Hex;
        operation?: number;
        value?: bigint;
        dataLength?: number;
    }) =>
        encodePacked(
            ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
            [
                params.operation ?? 0,
                params.to as Hex,
                params.value ?? BigInt(0),
                BigInt(params.dataLength ?? size(params.data)),
                params.data,
            ],
        );

    describe('getEnvelope', () => {
        it('keeps every signed field exactly, including amounts a JS number would round', () => {
            const transaction = generateSafeTransaction({
                to: target,
                value: '1000000000000000001',
                data: null,
                operation: 1,
                safeTxGas: '90000000000000000001',
                baseGas: '21000',
                gasPrice: '1000000007',
                gasToken: target,
                refundReceiver: target,
                nonce: '9007199254740993',
            });

            expect(
                safeTransactionEnvelopeUtils.getEnvelope(transaction),
            ).toEqual({
                to: target,
                value: '1000000000000000001',
                // A null calldata is a plain value transfer, which the signed struct expresses as
                // empty bytes rather than as an absent field.
                data: '0x',
                operation: 1,
                safeTxGas: '90000000000000000001',
                baseGas: '21000',
                gasPrice: '1000000007',
                gasToken: target,
                refundReceiver: target,
                nonce: '9007199254740993',
            });
        });
    });

    describe('verifyTransactionHash', () => {
        it.each([
            { label: 'a CALL', operation: 0 as const },
            { label: 'a DELEGATECALL', operation: 1 as const },
        ])(
            'matches the reported hash of $label transaction',
            ({ operation }) => {
                const fields = {
                    to: target,
                    value: '1',
                    data: '0xabcdef',
                    operation,
                    safeTxGas: '5',
                    baseGas: '6',
                    gasPrice: '7',
                    gasToken: zeroAddress,
                    refundReceiver: zeroAddress,
                    nonce: '11',
                };
                const transaction = generateSafeTransaction({
                    ...fields,
                    safeTxHash: hashSafeTx(fields),
                });

                expect(
                    safeTransactionEnvelopeUtils.verifyTransactionHash({
                        transaction,
                        safeAddress,
                        safeVersion,
                        chainId,
                    }),
                ).toEqual({
                    verification: SafeHashVerification.MATCH,
                    computedHash: transaction.safeTxHash,
                });
            },
        );

        it('reports a mismatch when a field disagrees with the reported hash', () => {
            const fields = {
                to: target,
                value: '1',
                data: '0x',
                operation: 0 as const,
                safeTxGas: '0',
                baseGas: '0',
                gasPrice: '0',
                gasToken: zeroAddress,
                refundReceiver: zeroAddress,
                nonce: '3',
            };
            const transaction = generateSafeTransaction({
                ...fields,
                value: '2',
                safeTxHash: hashSafeTx(fields),
            });

            const result = safeTransactionEnvelopeUtils.verifyTransactionHash({
                transaction,
                safeAddress,
                safeVersion,
                chainId,
            });

            expect(result.verification).toEqual(SafeHashVerification.MISMATCH);
            expect(result.computedHash).not.toEqual(transaction.safeTxHash);
        });

        it.each([
            {
                label: 'the Safe version is unknown',
                safeVersion: null,
                nonce: '1',
            },
            {
                label: 'the nonce exceeds a safe integer',
                safeVersion,
                nonce: '9007199254740993',
            },
        ])('cannot verify when $label', (params) => {
            expect(
                safeTransactionEnvelopeUtils.verifyTransactionHash({
                    transaction: generateSafeTransaction({
                        nonce: params.nonce,
                    }),
                    safeAddress,
                    safeVersion: params.safeVersion,
                    chainId,
                }),
            ).toEqual({ verification: SafeHashVerification.UNVERIFIABLE });
        });
    });

    describe('inspectBatch', () => {
        it('unpacks every call of a complete batch in order', () => {
            const data = encodeBatch(
                packCall({ to: target, data: '0x1234' }),
                packCall({
                    to: safeAddress,
                    data: '0xabcd',
                    operation: 1,
                    value: BigInt('1000000000000000001'),
                }),
            );

            expect(safeTransactionEnvelopeUtils.inspectBatch(data)).toEqual({
                status: SafeBatchStatus.COMPLETE,
                calls: [
                    {
                        to: target.toLowerCase(),
                        data: '0x1234',
                        operation: 0,
                        value: BigInt(0),
                    },
                    {
                        to: safeAddress.toLowerCase(),
                        data: '0xabcd',
                        operation: 1,
                        value: BigInt('1000000000000000001'),
                    },
                ],
            });
        });

        it('reports a truncated batch when a declared length runs past the payload', () => {
            const data = encodeBatch(
                packCall({ to: target, data: '0x1234' }),
                packCall({ to: safeAddress, data: '0xab', dataLength: 32 }),
            );

            const { status, calls } =
                safeTransactionEnvelopeUtils.inspectBatch(data);

            expect(status).toEqual(SafeBatchStatus.TRUNCATED);
            expect(calls).toHaveLength(1);
        });

        it('reports a truncated batch when trailing bytes are too short for a call', () => {
            const data = encodeBatch(
                packCall({ to: target, data: '0x1234' }),
                '0xdead',
            );

            const { status, calls } =
                safeTransactionEnvelopeUtils.inspectBatch(data);

            expect(status).toEqual(SafeBatchStatus.TRUNCATED);
            expect(calls).toHaveLength(1);
        });

        it('reports an unrecognized payload when the selector does not decode', () => {
            expect(
                safeTransactionEnvelopeUtils.inspectBatch('0x8d80ff0a1234'),
            ).toEqual({ status: SafeBatchStatus.UNRECOGNIZED, calls: [] });
        });

        it.each([
            { label: 'a plain value transfer', data: null },
            { label: 'a single unrelated call', data: '0xdeadbeef' },
            { label: 'a payload shorter than a selector', data: '0x1234' },
        ])('reports $label as not a batch', ({ data }) => {
            expect(safeTransactionEnvelopeUtils.inspectBatch(data)).toEqual({
                status: SafeBatchStatus.NOT_A_BATCH,
                calls: [],
            });
        });
    });
});
