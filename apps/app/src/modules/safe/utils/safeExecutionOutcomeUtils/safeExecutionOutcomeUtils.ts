import { type Hex, size, slice, toEventSelector } from 'viem';

/**
 * What a dispatched Safe execution actually did.
 *
 * The three named outcomes are different business results, not error grades: an outer revert
 * consumed nothing and can be retried at the same nonce, while both Safe events consume the nonce
 * and permanently close it - one having done the work, one not.
 */
export enum SafeExecutionOutcome {
    /**
     * The `execTransaction` call itself reverted, so the Safe's nonce increment rolled back with
     * everything else. Nothing was consumed and no Safe event was emitted. This is what a failing
     * inner call produces when the transaction carries `safeTxGas: 0` - the Safe's `GS013`.
     */
    OUTER_REVERT = 'OUTER_REVERT',
    /**
     * The Safe ran and the inner call failed. The nonce is consumed and the transaction can never
     * execute again, but the effect the payload described did not happen. Only reachable when the
     * transaction carries `safeTxGas > 0`, which this app never proposes - such a transaction
     * reaches an Aragon queue from Safe's own app or another integration.
     */
    EXECUTION_FAILURE = 'EXECUTION_FAILURE',
    /**
     * The Safe ran and the inner call succeeded. The only outcome that may be reported as done.
     */
    EXECUTION_SUCCESS = 'EXECUTION_SUCCESS',
    /**
     * The outer transaction succeeded but carried no Safe event for this transaction. Nothing is
     * known about the inner call, so it must not be read as either result.
     */
    UNMATCHED = 'UNMATCHED',
}

/**
 * The subset of a transaction receipt this classification needs. Typed structurally so it accepts
 * viem's receipt without the caller converting one.
 */
export interface ISafeExecutionReceipt {
    status: 'success' | 'reverted';
    logs: ReadonlyArray<{
        address: string;
        topics: readonly Hex[];
        data: Hex;
    }>;
}

export interface IClassifySafeExecutionParams {
    /**
     * Receipt of the transaction that called `execTransaction`.
     */
    receipt: ISafeExecutionReceipt;
    /**
     * Hash of the Safe transaction that was dispatched. The receipt can carry events for other
     * Safe transactions, so the outcome is only read from the event carrying this hash.
     */
    safeTxHash: string;
    /**
     * Address of the Safe that executed it. Required, not optional: the hash alone does not
     * attribute an event, because any contract can emit one carrying it.
     */
    safeAddress: string;
}

/**
 * Safe declares `ExecutionSuccess(bytes32 txHash, uint256 payment)` and its failure counterpart.
 * Indexing does not enter the event signature, so `topic0` is the same across Safe versions - but
 * where the hash lives does change: 1.4.1 marks `txHash` indexed, so it is `topics[1]`, while
 * 1.3.0 leaves it in the data. Both versions are in scope, since only EIP-1271 contract owners
 * require 1.4.1.
 */
const executionSuccessTopic = toEventSelector(
    'ExecutionSuccess(bytes32,uint256)',
);
const executionFailureTopic = toEventSelector(
    'ExecutionFailure(bytes32,uint256)',
);

class SafeExecutionOutcomeUtils {
    /**
     * Reads what happened from the receipt rather than from the fact that a receipt arrived.
     *
     * A mined transaction is not a successful one, and a successful outer transaction is not a
     * successful Safe transaction: `execTransaction` returns a boolean and reports a failed inner
     * call by event, so the surface that says "executed" has to read the event to be entitled to.
     */
    classify = (params: IClassifySafeExecutionParams): SafeExecutionOutcome => {
        const { receipt, safeTxHash, safeAddress } = params;

        // An outer revert rolled the nonce back with everything else, so there is no event to look
        // for and no execution to classify.
        if (receipt.status === 'reverted') {
            return SafeExecutionOutcome.OUTER_REVERT;
        }

        const target = safeTxHash.toLowerCase();
        const safe = safeAddress.toLowerCase();

        for (const log of receipt.logs) {
            const [topic, indexedHash] = log.topics;

            if (
                topic !== executionSuccessTopic &&
                topic !== executionFailureTopic
            ) {
                continue;
            }

            /**
             * Emitter first, then hash. An event is only the Safe's word if the Safe emitted it:
             * this app executes arbitrary batches, so an inner call can emit
             * `ExecutionSuccess(ourHash)` from any contract, and the Safe's own event comes last.
             * Matching on the hash alone would let such a log mask a real `ExecutionFailure`.
             */
            if (log.address.toLowerCase() !== safe) {
                continue;
            }

            const eventHash = indexedHash ?? this.firstWord(log.data);

            if (eventHash?.toLowerCase() !== target) {
                continue;
            }

            return topic === executionSuccessTopic
                ? SafeExecutionOutcome.EXECUTION_SUCCESS
                : SafeExecutionOutcome.EXECUTION_FAILURE;
        }

        return SafeExecutionOutcome.UNMATCHED;
    };

    private firstWord = (data: Hex): Hex | undefined =>
        size(data) < 32 ? undefined : slice(data, 0, 32);
}

export const safeExecutionOutcomeUtils = new SafeExecutionOutcomeUtils();
