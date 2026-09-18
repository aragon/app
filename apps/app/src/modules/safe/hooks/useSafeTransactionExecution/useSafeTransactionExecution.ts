import { addressUtils } from '@aragon/gov-ui-kit';
import type Safe from '@safe-global/protocol-kit';
import {
    type Hex,
    InsufficientFundsError,
    isHex,
    MethodNotFoundRpcError,
    MethodNotSupportedRpcError,
    TransactionRejectedRpcError,
    UnauthorizedProviderError,
    UnsupportedProviderMethodError,
    UserRejectedRequestError,
} from 'viem';
import {
    ConnectorAccountNotFoundError,
    ConnectorChainMismatchError,
} from 'wagmi';
import {
    getTransactionReceipt,
    sendTransaction,
    waitForTransactionReceipt,
} from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import {
    isRecord,
    isUnsignedIntegerString,
} from '@/shared/api/safeService/domain/safeDomainUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import {
    type ISafeExecutionReceipt,
    SafeExecutionOutcome,
    safeExecutionOutcomeUtils,
} from '../../utils/safeExecutionOutcomeUtils';
import type { ISafeTransactionEnvelope } from '../../utils/safeTransactionEnvelopeUtils';

/**
 * Taken from protocol-kit's own surface rather than `@safe-global/types-kit`, which this workspace
 * does not depend on directly. Derived from `createTransaction` rather than `isValidTransaction`,
 * whose parameter is a union with the service's response shape and so carries no `addSignature`.
 */
type SafeTransaction = Awaited<ReturnType<Safe['createTransaction']>>;
type SafeSignature = Parameters<SafeTransaction['addSignature']>[0];

/**
 * Serializable identity needed to recover a Safe execution after its receipt read or the dialog
 * itself is gone. Signatures are intentionally excluded: they are wallet-authorisation material,
 * not reload state.
 */
export interface ISafeRecoveryContext {
    safeAddress: Hex;
    chainId: number;
    safeTxHash: string;
    reviewedTx: ISafeTransactionEnvelope;
    proposal: {
        proposalId: string;
        pluginAddress: Hex;
        stageIndex: number;
    };
}

const isSafeTransactionEnvelope = (
    value: unknown,
): value is ISafeTransactionEnvelope => {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.to === 'string' &&
        addressUtils.isAddress(value.to) &&
        isUnsignedIntegerString(value.value) &&
        typeof value.data === 'string' &&
        isHex(value.data) &&
        (value.operation === 0 || value.operation === 1) &&
        isUnsignedIntegerString(value.safeTxGas) &&
        isUnsignedIntegerString(value.baseGas) &&
        isUnsignedIntegerString(value.gasPrice) &&
        typeof value.gasToken === 'string' &&
        addressUtils.isAddress(value.gasToken) &&
        typeof value.refundReceiver === 'string' &&
        addressUtils.isAddress(value.refundReceiver) &&
        isUnsignedIntegerString(value.nonce)
    );
};

/**
 * Validates persisted recovery data before any hash, address, or envelope value reaches a Safe
 * client or receipt verifier.
 */
export const parseSafeRecoveryContext = (
    value: unknown,
): ISafeRecoveryContext | undefined => {
    if (!isRecord(value) || !isSafeTransactionEnvelope(value.reviewedTx)) {
        return undefined;
    }

    const proposal = value.proposal;
    if (
        !isRecord(proposal) ||
        typeof proposal.proposalId !== 'string' ||
        proposal.proposalId.length === 0 ||
        typeof proposal.pluginAddress !== 'string' ||
        !addressUtils.isAddress(proposal.pluginAddress) ||
        typeof proposal.stageIndex !== 'number' ||
        !Number.isInteger(proposal.stageIndex) ||
        proposal.stageIndex < 0
    ) {
        return undefined;
    }

    if (
        typeof value.safeAddress !== 'string' ||
        !addressUtils.isAddress(value.safeAddress) ||
        typeof value.chainId !== 'number' ||
        !Number.isInteger(value.chainId) ||
        value.chainId <= 0 ||
        typeof value.safeTxHash !== 'string' ||
        !isHex(value.safeTxHash) ||
        value.safeTxHash.length !== 66
    ) {
        return undefined;
    }

    return {
        safeAddress: value.safeAddress as Hex,
        chainId: value.chainId,
        safeTxHash: value.safeTxHash,
        reviewedTx: value.reviewedTx,
        proposal: {
            proposalId: proposal.proposalId,
            pluginAddress: proposal.pluginAddress as Hex,
            stageIndex: proposal.stageIndex,
        },
    };
};

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

/**
 * The outer transaction is known, but its receipt or effect could not be reconciled yet. The hash
 * is carried deliberately so a caller can persist it instead of offering a second send.
 */
export class SafeExecutionPendingError extends Error {
    readonly hash: Hex;

    constructor(hash: Hex, options?: ErrorOptions) {
        super(
            'Safe execution was broadcast, but its outcome could not be reconciled',
            options,
        );
        this.name = 'SafeExecutionPendingError';
        this.hash = hash;
    }
}

/**
 * `sendTransaction` failed for a reason that is not a wallet rejection, so it cannot be known
 * whether the transaction reached the mempool. Distinct from `SafeExecutionPendingError`: there is
 * no hash to persist, so a caller must record the uncertainty (and never offer a blind resend)
 * rather than treat the failure as a clean retry.
 */
export class SafeExecutionSubmissionError extends Error {
    name = 'SafeExecutionSubmissionError';
}

const walkErrorCauseChain = (
    error: unknown,
    predicate: (cause: unknown) => boolean,
): boolean => {
    const seen = new Set<object>();
    let current = error;

    while (isRecord(current) && !seen.has(current)) {
        if (predicate(current)) {
            return true;
        }
        seen.add(current);
        current = current.cause;
    }

    return false;
};

/**
 * A wallet rejection means the transaction was never broadcast, so the collected signatures are
 * intact and the action is cleanly retryable. Viem normalizes provider rejections to typed errors,
 * which may be wrapped in a `TransactionExecutionError`; inspect the full cause chain instead of
 * guessing from message text. The raw EIP-1193 code remains supported for connectors that surface
 * `4001` without Viem's class.
 */
const isUserRejectionError = (error: unknown): boolean =>
    walkErrorCauseChain(
        error,
        (cause) =>
            cause instanceof UserRejectedRequestError ||
            (isRecord(cause) && cause.code === 4001),
    );

/**
 * These Viem/Wagmi errors are definitive pre-broadcast refusals. Unknown transport/RPC failures
 * stay uncertain: without a returned hash, a caller must reconcile them before offering a resend.
 * `ConnectorNotConnectedError` is a core error that the public React `wagmi` entry point does not
 * export, so its exact class name is the only available discriminant.
 */
const isKnownPreBroadcastError = (error: unknown): boolean =>
    walkErrorCauseChain(
        error,
        (cause) =>
            cause instanceof InsufficientFundsError ||
            cause instanceof MethodNotFoundRpcError ||
            cause instanceof MethodNotSupportedRpcError ||
            cause instanceof TransactionRejectedRpcError ||
            cause instanceof UnauthorizedProviderError ||
            cause instanceof UnsupportedProviderMethodError ||
            cause instanceof ConnectorAccountNotFoundError ||
            cause instanceof ConnectorChainMismatchError ||
            (isRecord(cause) && cause.name === 'ConnectorNotConnectedError'),
    );

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
    /**
     * Called synchronously immediately before the initial wallet send, after authority and simulation
     * checks have completed. A failure is an ordinary pre-broadcast error, not submission uncertainty.
     */
    beforeSubmit?: () => void;
    /**
     * Called after the outer transaction is broadcast and its hash is known, before receipt polling
     * starts, and again if the wallet replaces that transaction. A callback failure must not make a
     * known broadcast hash disappear.
     */
    onSubmitted?: (hash: Hex) => void;
}

export interface IResumeSafeExecutionParams {
    /**
     * Known outer execution hash. Resume only reads this transaction; it never sends another one.
     */
    hash: Hex;
    safeTxHash: string;
    safeAddress: string;
    chainId: number;
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

interface IClassifySafeExecutionReceiptParams {
    hash: Hex;
    receipt: ISafeExecutionReceipt;
    safeTxHash: string;
    safeAddress: string;
    verifyEffect?: (receipt: ISafeExecutionReceipt) => boolean;
}

const classifySafeExecutionReceipt = ({
    hash,
    receipt,
    safeTxHash,
    safeAddress,
    verifyEffect,
}: IClassifySafeExecutionReceiptParams): ISafeExecutionOutcomeReport => {
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

type ISafeExecutionReceiptWithHash = ISafeExecutionReceipt & {
    transactionHash?: unknown;
};

const getReceiptHash = (
    receipt: ISafeExecutionReceiptWithHash,
    fallback: Hex,
): Hex => {
    const { transactionHash } = receipt;

    return isHex(transactionHash) && transactionHash.length === 66
        ? transactionHash
        : fallback;
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
            beforeSubmit,
            onSubmitted,
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
        beforeSubmit?.();

        let hash: Hex;
        try {
            hash = await sendTransaction(wagmiConfig, {
                chainId,
                to: safeAddress as Hex,
                data: data as Hex,
                value: BigInt(0),
            });
        } catch (error) {
            if (
                isUserRejectionError(error) ||
                isKnownPreBroadcastError(error)
            ) {
                throw error;
            }
            throw new SafeExecutionSubmissionError(
                'Safe execution could not be confirmed as broadcast',
                { cause: error },
            );
        }
        let latestHash = hash;
        const notifySubmitted = (nextHash: Hex): void => {
            latestHash = nextHash;
            try {
                onSubmitted?.(nextHash);
            } catch (error) {
                monitoringUtils.logError(error, {
                    context: {
                        safeAddress,
                        chainId,
                        safeTxHash,
                        hash: nextHash,
                    },
                });
            }
        };

        try {
            notifySubmitted(hash);

            let receipt: ISafeExecutionReceiptWithHash;
            try {
                receipt = await waitForTransactionReceipt(wagmiConfig, {
                    hash,
                    chainId,
                    onReplaced: ({ transactionReceipt }) => {
                        notifySubmitted(
                            getReceiptHash(transactionReceipt, latestHash),
                        );
                    },
                });
            } catch {
                try {
                    receipt = await getTransactionReceipt(wagmiConfig, {
                        hash: latestHash,
                        chainId,
                    });
                } catch (receiptError) {
                    throw new SafeExecutionPendingError(latestHash, {
                        cause: receiptError,
                    });
                }
            }

            const receiptHash = getReceiptHash(receipt, latestHash);
            if (receiptHash !== latestHash) {
                notifySubmitted(receiptHash);
            }

            return classifySafeExecutionReceipt({
                hash: receiptHash,
                receipt,
                safeTxHash,
                safeAddress,
                verifyEffect,
            });
        } catch (cause) {
            if (cause instanceof SafeExecutionPendingError) {
                throw cause;
            }
            throw new SafeExecutionPendingError(latestHash, { cause });
        }
    };

    const resume = async ({
        hash,
        safeTxHash,
        safeAddress,
        chainId,
        verifyEffect,
    }: IResumeSafeExecutionParams): Promise<ISafeExecutionOutcomeReport> => {
        try {
            const receipt = await getTransactionReceipt(wagmiConfig, {
                hash,
                chainId,
            });

            return classifySafeExecutionReceipt({
                hash: getReceiptHash(receipt, hash),
                receipt,
                safeTxHash,
                safeAddress,
                verifyEffect,
            });
        } catch (cause) {
            if (cause instanceof SafeExecutionPendingError) {
                throw cause;
            }
            throw new SafeExecutionPendingError(hash, { cause });
        }
    };

    return { execute, resume };
};
