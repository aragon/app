import { addressUtils } from '@aragon/gov-ui-kit';
import type Safe from '@safe-global/protocol-kit';
import type { Hex } from 'viem';
import { sendTransaction, waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import {
    type ISafeExecutionReceipt,
    SafeExecutionOutcome,
    safeExecutionOutcomeUtils,
} from '../../utils/safeExecutionOutcomeUtils';

/**
 * Taken from protocol-kit's own surface rather than `@safe-global/types-kit`, which this workspace
 * does not depend on directly. Derived from `createTransaction` rather than `isValidTransaction`,
 * whose parameter is a union with the service's response shape and so carries no `addSignature`.
 */
type SafeTransaction = Awaited<ReturnType<Safe['createTransaction']>>;
type SafeSignature = Parameters<SafeTransaction['addSignature']>[0];

/**
 * Why an execution failed before any gas was spent, or what it produced after.
 *
 * `AUTHORITY_CHANGED` and `REJECTED` are refusals: nothing was submitted, the collected signatures
 * are untouched, and the transaction is still executable if the Safe's state comes back into line.
 * `EFFECT_MISSING` is the opposite - the transaction executed, the nonce is spent, and the caller's
 * own effect is absent from the receipt.
 */
export enum SafeExecutionResult {
    AUTHORITY_CHANGED = 'AUTHORITY_CHANGED',
    REJECTED = 'REJECTED',
    EXECUTED = 'EXECUTED',
    EFFECT_MISSING = 'EFFECT_MISSING',
    FAILED = 'FAILED',
}

export interface IExecuteSafeTransactionParams {
    /**
     * Initialised protocol-kit bound to the Safe and the connected signer.
     */
    protocolKit: Safe;
    /**
     * Transaction to execute, built from the reviewed envelope.
     */
    safeTransaction: SafeTransaction;
    /**
     * Hash of the transaction being executed, used to find the Safe's own event in the receipt.
     */
    safeTxHash: string;
    /**
     * Address of the Safe executing the transaction.
     */
    safeAddress: string;
    /**
     * Chain the execution must be sent on.
     */
    chainId: number;
    /**
     * Signatures collected for this transaction, in any order.
     */
    signatures: SafeSignature[];
    /**
     * Whether the caller's own effect landed, given the receipt of a successful Safe execution.
     *
     * A Safe reports success for a payload that accomplished nothing - a delegate call into an
     * address with no code being the case that motivated this - so a caller expecting a specific
     * onchain effect must prove it from the receipt rather than trust the Safe's event. Called
     * only when the outcome is `EXECUTION_SUCCESS`; an ordinary Safe transaction has no named
     * effect and omits it.
     */
    verifyEffect?: (receipt: ISafeExecutionReceipt) => boolean;
}

/**
 * Discriminated so a caller cannot read a hash that does not exist, or map a successful outcome
 * through a table of failure copy: a refusal has no hash, and only `FAILED` can carry an outcome
 * other than `EXECUTION_SUCCESS`.
 */
export type ISafeExecutionOutcomeReport =
    | {
          result:
              | SafeExecutionResult.AUTHORITY_CHANGED
              | SafeExecutionResult.REJECTED;
      }
    | {
          result: SafeExecutionResult.FAILED;
          hash: Hex;
          outcome: Exclude<
              SafeExecutionOutcome,
              SafeExecutionOutcome.EXECUTION_SUCCESS
          >;
      }
    | {
          result:
              | SafeExecutionResult.EXECUTED
              | SafeExecutionResult.EFFECT_MISSING;
          hash: Hex;
          outcome: SafeExecutionOutcome.EXECUTION_SUCCESS;
      };

/**
 * Executes a Safe transaction that already carries its signatures, and reports what happened.
 *
 * This is the account-wide half of the execution path: validate the signatures against the Safe's
 * live authority, simulate, submit, and classify the receipt. It decides nothing about meaning -
 * no copy, no governance state, no indexing - so the governance card and the account queue can
 * share it without either inheriting the other's vocabulary.
 *
 * Ordering is load-bearing and the reason this is one function rather than several: the threshold
 * check must read the contract rather than the proposal record, the signature-bytes assertion must
 * follow `addSignature`, and `isValidTransaction` must run with the signatures attached - asked any
 * earlier it reports a below-threshold transaction as broken, indistinguishably from a failing call.
 */
export const useSafeTransactionExecution = () => {
    const execute = async (
        params: IExecuteSafeTransactionParams,
    ): Promise<ISafeExecutionOutcomeReport> => {
        const {
            protocolKit,
            safeTransaction,
            safeTxHash,
            safeAddress,
            chainId,
            signatures,
            verifyEffect,
        } = params;

        /**
         * Authority is read from the Safe, not from the service record. A transaction carries the
         * `confirmationsRequired` it was proposed under, but the Safe validates against the
         * threshold and owner set it holds *now*: owners can be replaced and the threshold raised
         * after a signature is collected, which silently voids it. Chain truth, and it costs no
         * Safe API quota.
         */
        const [liveThreshold, liveOwners] = await Promise.all([
            protocolKit.getThreshold(),
            protocolKit.getOwners(),
        ]);
        const applicableSignatures = signatures.filter(({ signer }) =>
            liveOwners.some((owner) =>
                addressUtils.isAddressEqual(owner, signer),
            ),
        );

        if (applicableSignatures.length < liveThreshold) {
            // Below the applicable threshold: leave the collected signatures in the queue for the
            // remaining owners rather than paying gas to be turned away.
            return { result: SafeExecutionResult.AUTHORITY_CHANGED };
        }

        for (const signature of applicableSignatures) {
            safeTransaction.addSignature(signature);
        }

        // Dynamic: signature-byte encoding is only needed on execution and should not pull the SDK
        // into account and governance surfaces before an action is requested.
        const { buildSignatureBytes } = await import(
            '@safe-global/protocol-kit'
        );
        if (
            safeTransaction.encodedSignatures() !==
            buildSignatureBytes(applicableSignatures)
        ) {
            throw new Error(
                'Protocol Kit produced inconsistent Safe signature bytes',
            );
        }

        const canExecute =
            await protocolKit.isValidTransaction(safeTransaction);

        if (!canExecute) {
            return { result: SafeExecutionResult.REJECTED };
        }

        const data = await protocolKit.getEncodedTransaction(safeTransaction);
        const hash = await sendTransaction(wagmiConfig, {
            chainId,
            to: safeAddress as Hex,
            data: data as Hex,
            value: BigInt(0),
        });
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

        /**
         * A mined transaction is not a successful one, and a successful outer transaction is not a
         * successful Safe transaction.
         */
        const outcome = safeExecutionOutcomeUtils.classify({
            receipt,
            safeTxHash,
            safeAddress,
        });

        if (outcome !== SafeExecutionOutcome.EXECUTION_SUCCESS) {
            return { result: SafeExecutionResult.FAILED, hash, outcome };
        }

        if (verifyEffect?.(receipt) === false) {
            return {
                result: SafeExecutionResult.EFFECT_MISSING,
                hash,
                outcome,
            };
        }

        return { result: SafeExecutionResult.EXECUTED, hash, outcome };
    };

    return { execute };
};
