import { renderHook } from '@testing-library/react';
import { type Hex, pad, toEventSelector } from 'viem';
import * as WagmiActions from 'wagmi/actions';
import { SafeExecutionOutcome } from '../../utils/safeExecutionOutcomeUtils';
import {
    SafeExecutionResult,
    useSafeTransactionExecution,
} from './useSafeTransactionExecution';

jest.mock('wagmi/actions', () => ({
    sendTransaction: jest.fn(),
    waitForTransactionReceipt: jest.fn(),
}));

describe('useSafeTransactionExecution hook', () => {
    const owner = `0x${'11'.repeat(20)}` as Hex;
    const otherOwner = `0x${'22'.repeat(20)}` as Hex;
    const safeAddress = `0x${'5a'.repeat(20)}` as Hex;
    const safeTxHash = `0x${'ab'.repeat(32)}` as Hex;
    const outerHash = `0x${'cd'.repeat(32)}` as Hex;
    const signatureData = `0x${'99'.repeat(65)}` as Hex;

    const signature = (signer: Hex) => ({
        signer,
        data: signatureData,
        isContractSignature: false,
        staticPart: () => signatureData,
        dynamicPart: () => '',
    });

    /**
     * `encodedSignatures` returns what `buildSignatureBytes` builds from the same signatures, which
     * is the equality the hook asserts before spending gas. A stub that disagreed would be testing
     * the assertion rather than the path.
     */
    const safeTransaction = () => ({
        addSignature: jest.fn(),
        encodedSignatures: () => signatureData,
    });

    const protocolKit = (overrides?: {
        threshold?: number;
        owners?: Hex[];
        isValid?: boolean;
    }) => ({
        getThreshold: jest.fn().mockResolvedValue(overrides?.threshold ?? 1),
        getOwners: jest.fn().mockResolvedValue(overrides?.owners ?? [owner]),
        isValidTransaction: jest
            .fn()
            .mockResolvedValue(overrides?.isValid ?? true),
        getEncodedTransaction: jest.fn().mockResolvedValue('0xdeadbeef'),
    });

    const receiptWith = (topic: string) => ({
        status: 'success' as const,
        logs: [
            {
                address: safeAddress,
                topics: [toEventSelector(topic), safeTxHash] as Hex[],
                data: pad('0x01') as Hex,
            },
        ],
    });

    const run = (params?: {
        verifyEffect?: (receipt: unknown) => boolean;
        kit?: ReturnType<typeof protocolKit>;
    }) => {
        const { result } = renderHook(() => useSafeTransactionExecution());

        return result.current.execute({
            protocolKit: (params?.kit ?? protocolKit()) as never,
            safeTransaction: safeTransaction() as never,
            safeTxHash,
            safeAddress,
            chainId: 11_155_111,
            signatures: [signature(owner)] as never,
            verifyEffect: params?.verifyEffect as never,
        });
    };

    beforeEach(() => {
        jest.mocked(WagmiActions.sendTransaction).mockResolvedValue(
            outerHash as never,
        );
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receiptWith('ExecutionSuccess(bytes32,uint256)') as never,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('reports a successful execution when the caller names no effect to verify', async () => {
        // How the account queue calls this: an ordinary Safe transaction has no effect the app can
        // name, so the Safe's own event is the whole answer and nothing further is required of it.
        const report = await run();

        expect(report.result).toBe(SafeExecutionResult.EXECUTED);
        expect(report).toHaveProperty('hash', outerHash);
    });

    it('distinguishes an executed transaction whose effect never landed', async () => {
        const report = await run({ verifyEffect: () => false });

        expect(report.result).toBe(SafeExecutionResult.EFFECT_MISSING);
        expect(report).toHaveProperty(
            'outcome',
            SafeExecutionOutcome.EXECUTION_SUCCESS,
        );
    });

    it('does not ask whether an effect landed when the Safe transaction itself failed', async () => {
        // The predicate reads a receipt for evidence of work the Safe never did. Asking on a failed
        // execution invites a caller to answer "no effect" for a transaction that can be retried,
        // which is the opposite of the truth: the nonce survives an outer revert.
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receiptWith('ExecutionFailure(bytes32,uint256)') as never,
        );
        const verifyEffect = jest.fn().mockReturnValue(true);

        const report = await run({ verifyEffect });

        expect(report.result).toBe(SafeExecutionResult.FAILED);
        expect(report).toHaveProperty(
            'outcome',
            SafeExecutionOutcome.EXECUTION_FAILURE,
        );
        expect(verifyEffect).not.toHaveBeenCalled();
    });

    it('refuses to spend gas when the live owner set no longer meets the threshold', async () => {
        // The signature is genuine but its signer is no longer an owner, so it cannot count. The
        // collected set stays in the queue for whoever can still sign.
        const report = await run({
            kit: protocolKit({ threshold: 1, owners: [otherOwner] }),
        });

        expect(report.result).toBe(SafeExecutionResult.AUTHORITY_CHANGED);
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });

    it('refuses to submit a transaction the Safe rejects in simulation', async () => {
        const report = await run({ kit: protocolKit({ isValid: false }) });

        expect(report.result).toBe(SafeExecutionResult.REJECTED);
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
    });
});
