import { renderHook } from '@testing-library/react';
import {
    type Hex,
    InsufficientFundsError,
    pad,
    toEventSelector,
    UserRejectedRequestError,
} from 'viem';
import * as WagmiActions from 'wagmi/actions';
import { SafeExecutionOutcome } from '../../utils/safeExecutionOutcomeUtils';
import {
    parseSafeRecoveryContext,
    SafeExecutionPendingError,
    SafeExecutionResult,
    SafeExecutionSubmissionError,
    useSafeTransactionExecution,
} from './useSafeTransactionExecution';

jest.mock('wagmi/actions', () => ({
    getTransactionReceipt: jest.fn(),
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

    const resumeRun = (params?: {
        verifyEffect?: (receipt: unknown) => boolean;
    }) => {
        const { result } = renderHook(() => useSafeTransactionExecution());

        return result.current.resume({
            hash: outerHash,
            safeTxHash,
            safeAddress,
            chainId: 11_155_111,
            verifyEffect: params?.verifyEffect as never,
        });
    };

    const run = (params?: {
        verifyEffect?: (receipt: unknown) => boolean;
        beforeSubmit?: () => void;
        onSubmitted?: (hash: Hex) => void;
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
            beforeSubmit: params?.beforeSubmit,
            onSubmitted: params?.onSubmitted,
        });
    };

    beforeEach(() => {
        jest.mocked(WagmiActions.sendTransaction).mockResolvedValue(
            outerHash as never,
        );
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockResolvedValue(
            receiptWith('ExecutionSuccess(bytes32,uint256)') as never,
        );
        jest.mocked(WagmiActions.getTransactionReceipt).mockResolvedValue(
            receiptWith('ExecutionSuccess(bytes32,uint256)') as never,
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
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

    it('retains a broadcast hash for read-only resume after receipt read fails', async () => {
        const waitError = new Error('receipt timeout');
        const receiptError = new Error('receipt unavailable');
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockRejectedValue(
            waitError,
        );
        jest.mocked(WagmiActions.getTransactionReceipt).mockRejectedValueOnce(
            receiptError,
        );
        const onSubmitted = jest.fn();
        const error = await run({ onSubmitted }).catch(
            (caught: unknown) => caught,
        );
        expect(error).toBeInstanceOf(SafeExecutionPendingError);
        expect(error).toMatchObject({
            hash: outerHash,
            cause: receiptError,
        });
        expect(onSubmitted).toHaveBeenCalledWith(outerHash);

        const verifyEffect = jest.fn().mockReturnValue(true);
        const report = await resumeRun({ verifyEffect });

        expect(report.result).toBe(SafeExecutionResult.EXECUTED);
        expect(verifyEffect).toHaveBeenCalledTimes(1);
        expect(WagmiActions.sendTransaction).toHaveBeenCalledTimes(1);
        expect(WagmiActions.waitForTransactionReceipt).toHaveBeenCalledTimes(1);
    });

    it('keeps the broadcast hash when recovery registration throws', async () => {
        const waitError = new Error('receipt timeout');
        const receiptError = new Error('receipt unavailable');
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockRejectedValue(
            waitError,
        );
        jest.mocked(WagmiActions.getTransactionReceipt).mockRejectedValueOnce(
            receiptError,
        );
        const callbackError = new Error('registration failed');

        await expect(
            run({
                onSubmitted: () => {
                    throw callbackError;
                },
            }),
        ).rejects.toMatchObject({
            hash: outerHash,
            cause: receiptError,
        });
    });

    it('tracks a replacement hash through the shared submission callback', async () => {
        const replacementHash = `0x${'ef'.repeat(32)}` as Hex;
        const replacementReceipt = {
            ...receiptWith('ExecutionSuccess(bytes32,uint256)'),
            transactionHash: replacementHash,
        };
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockImplementation(
            (_config, params) => {
                params.onReplaced?.({
                    transactionReceipt: replacementReceipt,
                } as never);
                return Promise.resolve(replacementReceipt as never);
            },
        );
        const onSubmitted = jest.fn();

        const report = await run({ onSubmitted });

        expect(report).toMatchObject({
            result: SafeExecutionResult.EXECUTED,
            hash: replacementHash,
        });
        expect(onSubmitted).toHaveBeenNthCalledWith(1, outerHash);
        expect(onSubmitted).toHaveBeenNthCalledWith(2, replacementHash);
    });

    it('classifies a reverted receipt after the waiter reports failure', async () => {
        jest.mocked(WagmiActions.waitForTransactionReceipt).mockRejectedValue(
            new Error('transaction reverted'),
        );
        jest.mocked(WagmiActions.getTransactionReceipt).mockResolvedValue({
            status: 'reverted',
            logs: [],
        } as never);

        const report = await run();

        expect(report).toEqual({
            result: SafeExecutionResult.FAILED,
            hash: outerHash,
            outcome: SafeExecutionOutcome.OUTER_REVERT,
        });
    });

    it('carries the broadcast hash when effect verification throws', async () => {
        const verificationError = new Error('effect lookup failed');

        await expect(
            run({
                verifyEffect: () => {
                    throw verificationError;
                },
            }),
        ).rejects.toMatchObject({
            hash: outerHash,
            cause: verificationError,
        });
    });

    it('surfaces non-rejection send failures as submission uncertainty', async () => {
        const transportError = new Error('RPC transport lost');
        jest.mocked(WagmiActions.sendTransaction).mockRejectedValue(
            transportError,
        );

        const error = await run().catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(SafeExecutionSubmissionError);
        expect(error).toMatchObject({ cause: transportError });
        expect(WagmiActions.waitForTransactionReceipt).not.toHaveBeenCalled();
        expect(WagmiActions.getTransactionReceipt).not.toHaveBeenCalled();
    });

    it('keeps a typed insufficient-funds failure retryable', async () => {
        const insufficientFunds = new InsufficientFundsError();
        const wrappedError = new Error('send transaction failed', {
            cause: insufficientFunds,
        });
        jest.mocked(WagmiActions.sendTransaction).mockRejectedValue(
            wrappedError,
        );

        await expect(run()).rejects.toBe(wrappedError);
        expect(WagmiActions.waitForTransactionReceipt).not.toHaveBeenCalled();
        expect(WagmiActions.getTransactionReceipt).not.toHaveBeenCalled();
    });

    it('keeps a disconnected wallet preflight failure retryable', async () => {
        const disconnectedWalletError = Object.assign(
            new Error('connector unavailable'),
            { name: 'ConnectorNotConnectedError' },
        );
        jest.mocked(WagmiActions.sendTransaction).mockRejectedValue(
            disconnectedWalletError,
        );

        await expect(run()).rejects.toBe(disconnectedWalletError);
        expect(WagmiActions.waitForTransactionReceipt).not.toHaveBeenCalled();
        expect(WagmiActions.getTransactionReceipt).not.toHaveBeenCalled();
    });

    it('keeps a wallet rejection retryable', async () => {
        const rejection = Object.assign(
            new Error('User rejected the request'),
            { code: 4001 },
        );
        jest.mocked(WagmiActions.sendTransaction).mockRejectedValue(rejection);

        await expect(run()).rejects.toBe(rejection);
        expect(WagmiActions.waitForTransactionReceipt).not.toHaveBeenCalled();
        expect(WagmiActions.getTransactionReceipt).not.toHaveBeenCalled();
    });

    it('keeps a typed wallet rejection retryable through wrapped causes', async () => {
        const rejection = new UserRejectedRequestError(
            new Error('wallet refused'),
        );
        const wrappedError = new Error('wallet send failed', {
            cause: rejection,
        });
        jest.mocked(WagmiActions.sendTransaction).mockRejectedValue(
            wrappedError,
        );

        await expect(run()).rejects.toBe(wrappedError);
        expect(WagmiActions.waitForTransactionReceipt).not.toHaveBeenCalled();
        expect(WagmiActions.getTransactionReceipt).not.toHaveBeenCalled();
    });

    it('does not infer wallet rejection from message text', async () => {
        const messageOnlyError = new Error('User rejected the request');
        jest.mocked(WagmiActions.sendTransaction).mockRejectedValue(
            messageOnlyError,
        );

        const error = await run().catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(SafeExecutionSubmissionError);
        expect(error).toMatchObject({ cause: messageOnlyError });
    });

    it('does not send when the pre-submit validation fails', async () => {
        const validationError = new Error('stale consent');

        await expect(
            run({
                beforeSubmit: () => {
                    throw validationError;
                },
            }),
        ).rejects.toBe(validationError);
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
        expect(WagmiActions.waitForTransactionReceipt).not.toHaveBeenCalled();
        expect(WagmiActions.getTransactionReceipt).not.toHaveBeenCalled();
    });

    it('classifies an unmatched resumed receipt without sending again', async () => {
        jest.mocked(WagmiActions.getTransactionReceipt).mockResolvedValue({
            status: 'success',
            logs: [],
        } as never);

        const report = await resumeRun();

        expect(report).toEqual({
            result: SafeExecutionResult.FAILED,
            hash: outerHash,
            outcome: SafeExecutionOutcome.UNMATCHED,
        });
        expect(WagmiActions.sendTransaction).not.toHaveBeenCalled();
        expect(WagmiActions.waitForTransactionReceipt).not.toHaveBeenCalled();
    });

    it('rejects malformed persisted recovery envelope data', () => {
        expect(
            parseSafeRecoveryContext({
                safeAddress,
                chainId: 11_155_111,
                safeTxHash,
                reviewedTx: {
                    to: safeAddress,
                    value: '0',
                    data: '0x',
                    operation: 0,
                    safeTxGas: '0',
                    baseGas: '0',
                    gasPrice: '0',
                    gasToken: safeAddress,
                    refundReceiver: safeAddress,
                    nonce: 'not-a-number',
                },
                proposal: {
                    proposalId: 'proposal',
                    pluginAddress: safeAddress,
                    stageIndex: 0,
                },
            }),
        ).toBeUndefined();
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
