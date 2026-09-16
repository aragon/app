'use client';
import { addressUtils } from '@aragon/gov-ui-kit';
import type Safe from '@safe-global/protocol-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { getConnection } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { Network } from '@/shared/api/daoService';
import {
    type ISafeMultisigTransaction,
    type ISafeQueueResponse,
    safeService,
    safeServiceKeys,
    useConfirmSafeTransaction,
} from '@/shared/api/safeService';
import { errorUtils, type ISerializedError } from '@/shared/utils/errorUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { SafeExecutionOutcome } from '../../utils/safeExecutionOutcomeUtils';
import { safeTransactionEnvelopeUtils } from '../../utils/safeTransactionEnvelopeUtils';
import {
    type ISafeExecutionOutcomeReport,
    SafeExecutionResult,
    useSafeTransactionExecution,
} from '../useSafeTransactionExecution';

export interface IUseSafeTransactionActionsParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe holding the transaction.
     */
    safeAddress: string;
    /**
     * Chain the signature and execution are produced for.
     */
    chainId: number;
}

/**
 * Result of an execution attempt, discriminated so a refusal cannot be read as a hash and a success
 * cannot be read as a failure. `hash` is present only when a transaction was actually sent — a
 * refusal spends no gas and has no hash to link to.
 *
 * `safeTxHash` identifies the queued transaction the attempt was made against, which is a different
 * value from `hash`: the Safe transaction service and the Safe app address a transaction by the
 * former, while a block explorer needs the latter. Both are carried so a caller can link either
 * without re-deriving one from the other.
 */
export type ISafeExecutionActionOutcome =
    | { status: 'executed'; hash: string; safeTxHash: string }
    | {
          status: 'error';
          messageKey: string;
          hash?: string;
          safeTxHash?: string;
      };

export interface ISafeTransactionActions {
    /**
     * Signs the reviewed transaction and submits the owner's confirmation. Offchain and free.
     */
    confirm: (transaction: ISafeMultisigTransaction) => Promise<void>;
    /**
     * Whether a confirmation is in flight.
     */
    isConfirming: boolean;
    /**
     * Leaf translation key of the last confirmation refusal, or undefined. Namespaced by the caller
     * under `app.safe.safePendingTransactionList.item`.
     */
    confirmError?: string;
    /**
     * Confirmation the Safe service accepted for the connected owner but the queue has not returned
     * yet, keyed `<safeTxHash>:<owner>` in lowercase. Reports that the signature is stored, so the
     * owner is neither re-prompted nor left without an answer; it never advances the confirmation
     * count, which only the queue can do.
     */
    submittedConfirmations: Set<string>;
    /**
     * Whether reconciliation gave up before the queue returned the accepted confirmation. The
     * signature is stored either way; only its visibility is outstanding.
     */
    confirmationSyncTimedOut: boolean;
    /**
     * Re-reads the queue on demand, for an owner whose accepted confirmation has not appeared.
     */
    refreshQueue: () => void;
    /**
     * Executes a queued transaction that already carries its signatures. Returns a classified
     * outcome the caller surfaces where it survives the row leaving the queue.
     */
    execute: (
        transaction: ISafeMultisigTransaction,
    ) => Promise<ISafeExecutionActionOutcome>;
    /**
     * Whether an execution is in flight.
     */
    isExecuting: boolean;
}

const toSafeNonce = (nonce: string): number => {
    const parsedNonce = Number(nonce);

    if (!Number.isSafeInteger(parsedNonce) || parsedNonce < 0) {
        throw new Error('Safe nonce cannot be represented safely');
    }

    return parsedNonce;
};

const isSameEnvelope = (
    left: ISafeMultisigTransaction,
    right: ISafeMultisigTransaction,
): boolean => {
    const leftEnvelope = safeTransactionEnvelopeUtils.getEnvelope(left);
    const rightEnvelope = safeTransactionEnvelopeUtils.getEnvelope(right);

    return JSON.stringify(leftEnvelope) === JSON.stringify(rightEnvelope);
};

const isSafeOwner = async (
    protocolKit: Safe,
    address: string,
): Promise<boolean> => {
    const owners = await protocolKit.getOwners();
    return owners.some((owner) => addressUtils.isAddressEqual(owner, address));
};

const hasEip1193Request = (value: unknown): boolean =>
    value != null &&
    typeof value === 'object' &&
    'request' in value &&
    typeof value.request === 'function';

/**
 * Wallet rejection texts, mirroring the expected-behaviour patterns `monitoringUtils` routes out of
 * the alert stream. Matched alongside the EIP-1193 code because a rejection can arrive as a wrapped
 * `cause` whose code was lost, and because protocol-kit's signer can surface an ethers-shaped
 * `ACTION_REJECTED` instead of a numeric code.
 */
const userRejectionMessages = [
    'user rejected the request',
    'signing aborted by user',
    'user denied transaction signature',
] as const;

const isUserRejectionError = (error: unknown): boolean => {
    let current: ISerializedError | undefined = errorUtils.serialize(error);

    while (current != null) {
        const message = current.message?.toLowerCase();

        if (
            current.code === 4001 ||
            current.code === '4001' ||
            current.code === 'ACTION_REJECTED' ||
            current.name === 'UserRejectedRequestError' ||
            (message != null &&
                userRejectionMessages.some((pattern) =>
                    message.includes(pattern),
                ))
        ) {
            return true;
        }

        current = current.cause;
    }

    return false;
};

/**
 * Generic account copy for a Safe execution that ran but did not do what was intended. Each outcome
 * is a different situation — the nonce survives an outer revert and is spent by the other two — and
 * none of them claims a governance report effect: an ordinary account transaction has none to name.
 */
const executionOutcomeKeys = {
    [SafeExecutionOutcome.OUTER_REVERT]: 'reverted',
    [SafeExecutionOutcome.EXECUTION_FAILURE]: 'innerFailed',
    [SafeExecutionOutcome.UNMATCHED]: 'unconfirmed',
} as const;

const classifyReport = (
    report: ISafeExecutionOutcomeReport,
    safeTxHash: string,
): ISafeExecutionActionOutcome => {
    if (report.result === SafeExecutionResult.EXECUTED) {
        return { status: 'executed', hash: report.hash, safeTxHash };
    }

    if (report.result === SafeExecutionResult.AUTHORITY_CHANGED) {
        return { status: 'error', messageKey: 'authorityChanged', safeTxHash };
    }

    if (report.result === SafeExecutionResult.REJECTED) {
        return { status: 'error', messageKey: 'rejected', safeTxHash };
    }

    if (report.result === SafeExecutionResult.FAILED) {
        return {
            status: 'error',
            messageKey: executionOutcomeKeys[report.outcome],
            hash: report.hash,
            safeTxHash,
        };
    }

    // EFFECT_MISSING: reachable only with a `verifyEffect`, which the account path never passes.
    // Treated as unconfirmed rather than trusted as done.
    return { status: 'error', messageKey: 'unconfirmed', safeTxHash };
};

/**
 * Confirms and executes queued Safe transactions for the account queue.
 *
 * Confirming is offchain and free; executing spends gas and has its own prerequisites. The two are
 * independent: a confirmation the service accepted stands even when a later execution is refused,
 * and each keeps its own in-flight and error state so neither can report the other's outcome.
 *
 * Every state truth is read live at action time — the connected signer, the queue's confirmations,
 * the Safe's nonce, and (inside the shared execution seam) its owners and threshold — because the
 * reviewed record can be minutes stale by the time an owner acts.
 */
export const useSafeTransactionActions = (
    params: IUseSafeTransactionActionsParams,
): ISafeTransactionActions => {
    const { network, safeAddress, chainId } = params;

    const queryClient = useQueryClient();
    const { address: connectedAddress } = useWalletAccount();
    // The action runs from a closure captured when the review dialog opened, which can predate the
    // wallet the guard connects. A ref read at action time is the live signer; the closure's copy
    // is whatever was connected at review time, often nothing.
    const latestConnectedAddress = useRef(connectedAddress);
    const { mutateAsync: confirmTransaction } = useConfirmSafeTransaction();
    const { execute: executeSafeTransaction } = useSafeTransactionExecution();
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState<string>();
    const [isExecuting, setIsExecuting] = useState(false);
    const [submittedConfirmations, setSubmittedConfirmations] = useState(
        () => new Set<string>(),
    );
    const [confirmationSyncTimedOut, setConfirmationSyncTimedOut] =
        useState(false);
    const isMounted = useRef(true);

    useEffect(
        () => () => {
            isMounted.current = false;
        },
        [],
    );

    useEffect(() => {
        latestConnectedAddress.current = connectedAddress;
    }, [connectedAddress]);

    const urlParams = { network, address: safeAddress };

    /**
     * Rebuilds the reviewed envelope and the kit bound to the connected owner, and refuses to go
     * further if the hash no longer matches its fields: the reviewed payload is the only thing
     * authorised, whatever the service reports the transaction as.
     */
    const prepare = async (transaction: ISafeMultisigTransaction) => {
        const connection = getConnection(wagmiConfig);
        const provider = await connection.connector?.getProvider({ chainId });
        const signerAddress = latestConnectedAddress.current;

        if (!hasEip1193Request(provider) || signerAddress == null) {
            throw new Error('Connected wallet does not expose a provider');
        }

        // Dynamic: the Protocol Kit is only needed once an owner acts, and statically importing it
        // pulls the whole SDK into the page bundle.
        const {
            default: Safe,
            EthSafeSignature,
            EthSafeTransaction,
        } = await import('@safe-global/protocol-kit');
        const protocolKit = await Safe.init({
            provider: provider as Parameters<typeof Safe.init>[0]['provider'],
            signer: signerAddress,
            safeAddress,
        });

        const envelope = safeTransactionEnvelopeUtils.getEnvelope(transaction);
        const safeTransaction = new EthSafeTransaction({
            ...envelope,
            nonce: toSafeNonce(envelope.nonce),
        });
        const safeTxHash =
            await protocolKit.getTransactionHash(safeTransaction);

        if (safeTxHash.toLowerCase() !== transaction.safeTxHash.toLowerCase()) {
            throw new Error(
                'Queued Safe transaction hash does not match its transaction data',
            );
        }

        return {
            protocolKit,
            safeTransaction,
            safeTxHash,
            signerAddress,
            EthSafeSignature,
        };
    };

    const refreshQueue = () => {
        void queryClient
            .invalidateQueries({
                queryKey: safeServiceKeys.safePendingTransactions({
                    urlParams,
                }),
            })
            .catch((error: unknown) =>
                monitoringUtils.logError(error, {
                    context: { safeAddress, operation: 'safe_refresh_queue' },
                }),
            );
    };

    /**
     * Re-reads the queue on a backoff until `isSettled` accepts the snapshot, and returns whether
     * it ever did.
     *
     * Needed because the backend serves the queue from a shared cache that can still hold the
     * pre-action snapshot for a moment after the service accepted a signature or the chain
     * executed a transaction. Delays back off rather than hammering a rate-limited service, and
     * running out of them is not a failure — the action already happened, only its visibility is
     * outstanding, and the list's own interval keeps trying.
     */
    const reconcileQueue = async (
        operation: string,
        safeTxHash: string,
        isSettled: (queue: ISafeQueueResponse) => boolean,
    ): Promise<boolean> => {
        const queryKey = safeServiceKeys.safePendingTransactions({ urlParams });

        try {
            for (const delay of [1000, 2000, 4000, 8000]) {
                const { promise, resolve } = Promise.withResolvers<void>();
                setTimeout(resolve, delay);
                await promise;

                if (!isMounted.current) {
                    return false;
                }

                // Read the service directly rather than refetching through the cache: the row's
                // query may not be the only observer, and seeding the result updates the list in
                // the same step.
                const queue = await safeService.getSafePendingTransactions({
                    urlParams,
                });
                queryClient.setQueryData<ISafeQueueResponse>(queryKey, queue);

                if (isSettled(queue)) {
                    return true;
                }
            }
        } catch (error) {
            monitoringUtils.logError(error, {
                context: { safeAddress, safeTxHash, operation },
            });
        }

        return false;
    };

    /**
     * Answers an accepted confirmation as soon as the queue returns it. The signature is already
     * stored by the time this runs, so the only question is when the row can stop saying so.
     */
    const reconcileConfirmation = async (safeTxHash: string, owner: string) => {
        const key = `${safeTxHash.toLowerCase()}:${owner.toLowerCase()}`;

        setSubmittedConfirmations((current) => new Set(current).add(key));
        setConfirmationSyncTimedOut(false);

        const settled = await reconcileQueue(
            'safe_reconcile_confirmation',
            safeTxHash,
            (queue) => {
                const live = queue.results.find(
                    (candidate) =>
                        candidate.safeTxHash.toLowerCase() ===
                        safeTxHash.toLowerCase(),
                );

                // Gone from the queue (executed or replaced) counts as caught up: the row itself is
                // no longer there to report anything about.
                return (
                    live == null ||
                    live.confirmations.some((confirmation) =>
                        addressUtils.isAddressEqual(confirmation.owner, owner),
                    )
                );
            },
        );

        if (!isMounted.current) {
            return;
        }

        if (settled) {
            setSubmittedConfirmations((current) => {
                const next = new Set(current);
                next.delete(key);

                return next;
            });

            return;
        }

        setConfirmationSyncTimedOut(true);
    };

    /**
     * Drops an executed transaction from the queue as soon as the backend stops returning it.
     *
     * A single invalidation is not enough: the executed transaction reaches the backend's cache
     * after the receipt, so the row it just executed keeps rendering as pending. Only the queue is
     * re-read per pass — the executed transaction leaving it is enough to drop the row, and the
     * advanced nonce the list also filters by arrives with the single `invalidateSafeState` once
     * the queue has caught up, rather than costing an extra info read on every pass.
     */
    const reconcileExecution = async (safeTxHash: string) => {
        await reconcileQueue(
            'safe_reconcile_execution',
            safeTxHash,
            (queue) =>
                !queue.results.some(
                    (candidate) =>
                        candidate.safeTxHash.toLowerCase() ===
                        safeTxHash.toLowerCase(),
                ),
        );

        invalidateSafeState();
    };

    /**
     * Refreshed on every execution exit, success or refusal. An executed transaction has left the
     * queue and moved the nonce, and a refusal was decided against a queue and nonce that are now
     * the stale part — so info, queue and history are all re-read.
     *
     * Never awaited by the caller and never allowed to throw: the receipt is already classified by
     * the time this runs, and losing "executed, here is the hash" because a cache refresh failed
     * would report a sent transaction as an error.
     */
    const invalidateSafeState = () => {
        void Promise.all([
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safeInfo({ urlParams }),
            }),
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safePendingTransactions({
                    urlParams,
                }),
            }),
            queryClient.invalidateQueries({
                queryKey: safeServiceKeys.safeTransactionHistory({ urlParams }),
            }),
        ]).catch((error: unknown) =>
            monitoringUtils.logError(error, {
                context: { safeAddress, operation: 'safe_refresh_state' },
            }),
        );
    };

    const confirm = async (transaction: ISafeMultisigTransaction) => {
        setIsConfirming(true);
        setConfirmError(undefined);

        try {
            const pending = await safeService.getSafePendingTransactions({
                urlParams,
            });

            if (pending.meta.stale) {
                setConfirmError('stale');
                return;
            }

            const live = pending.results.find(
                (candidate) =>
                    candidate.safeTxHash.toLowerCase() ===
                    transaction.safeTxHash.toLowerCase(),
            );

            if (live == null) {
                setConfirmError('unavailable');
                return;
            }

            if (!isSameEnvelope(live, transaction)) {
                setConfirmError('hashMismatch');
                return;
            }
            const connectedSignerAddress = latestConnectedAddress.current;
            // A confirmation this session already had accepted counts as held even while the queue
            // still serves the older snapshot, so the owner is never asked to sign it twice.
            if (
                connectedSignerAddress != null &&
                (live.confirmations.some(({ owner }) =>
                    addressUtils.isAddressEqual(owner, connectedSignerAddress),
                ) ||
                    submittedConfirmations.has(
                        `${transaction.safeTxHash.toLowerCase()}:${connectedSignerAddress.toLowerCase()}`,
                    ))
            ) {
                setConfirmError('alreadyConfirmed');
                return;
            }

            const nextNonce = await safeService.getSafeNextNonce({ urlParams });

            if (BigInt(nextNonce.currentNonce) > BigInt(transaction.nonce)) {
                setConfirmError('nonceConsumed');
                return;
            }

            const { protocolKit, safeTransaction, safeTxHash, signerAddress } =
                await prepare(transaction);
            // Only owners can confirm. The service would reject a non-owner, but a rejected wallet
            // prompt is worse than not prompting: the owner set is read from chain, not the record.
            const isOwner = await isSafeOwner(protocolKit, signerAddress);

            if (!isOwner) {
                setConfirmError('notOwner');
                return;
            }

            const signature = await protocolKit.signTypedData(safeTransaction);

            await confirmTransaction({
                urlParams: { network, safeTxHash },
                body: { signature: signature.data },
            });

            // The POST resolved, so the signature is stored. Reconciliation runs detached and is
            // never fatal: reporting a failed cache re-read as a failed confirmation would re-prompt
            // the owner for a signature the Safe already holds.
            void reconcileConfirmation(safeTxHash, signerAddress);
        } catch (error) {
            // Always reported, rejections included: `monitoringUtils.beforeSend` tags expected
            // wallet behaviour so it stays searchable without alerting. Only the row copy is
            // withheld — an owner who dismissed the prompt knows what they did, and "could not be
            // submitted, try again" would describe a failure that never happened.
            monitoringUtils.logError(error, {
                context: {
                    safeAddress,
                    safeTxHash: transaction.safeTxHash,
                    operation: 'safe_confirm_transaction',
                },
            });

            if (!isUserRejectionError(error)) {
                setConfirmError('error');
            }
        } finally {
            setIsConfirming(false);
        }
    };

    /**
     * Executes a queued transaction that already carries its signatures. No `verifyEffect` is
     * passed: an ordinary Safe transaction has no effect this surface can name, so the Safe's own
     * event is the whole answer. A governance report is the exception, and its card owns that.
     */
    const execute = async (
        transaction: ISafeMultisigTransaction,
    ): Promise<ISafeExecutionActionOutcome> => {
        setIsExecuting(true);
        let outcome: ISafeExecutionActionOutcome | undefined;

        try {
            // Read the transaction as the service holds it *now*, not as it was reviewed: a
            // signature collected since review must count, or execution refuses a set that is
            // actually complete. Matched by the reviewed hash, which binds the exact envelope.
            const pending = await safeService.getSafePendingTransactions({
                urlParams,
            });

            if (pending.meta.stale) {
                return { status: 'error', messageKey: 'stale' };
            }

            const live = pending.results.find(
                (candidate) =>
                    candidate.safeTxHash.toLowerCase() ===
                    transaction.safeTxHash.toLowerCase(),
            );

            if (live == null) {
                // Gone from the queue: executed or replaced out of band. Nothing to submit.
                return { status: 'error', messageKey: 'unavailable' };
            }

            if (!isSameEnvelope(live, transaction)) {
                return { status: 'error', messageKey: 'hashMismatch' };
            }

            // Repeated because nothing reserved the reviewed slot while the dialog was open. Both
            // refusals below cost no gas.
            const nextNonce = await safeService.getSafeNextNonce({ urlParams });

            if (BigInt(nextNonce.currentNonce) > BigInt(transaction.nonce)) {
                // The Safe moved past this nonce: the transaction can never execute.
                return { status: 'error', messageKey: 'nonceConsumed' };
            }

            if (BigInt(transaction.nonce) !== BigInt(nextNonce.currentNonce)) {
                // Queued behind the current nonce: executable later, not now.
                return { status: 'error', messageKey: 'nonceQueued' };
            }
            const {
                protocolKit,
                safeTransaction,
                safeTxHash,
                signerAddress,
                EthSafeSignature,
            } = await prepare(transaction);

            if (!(await isSafeOwner(protocolKit, signerAddress))) {
                return { status: 'error', messageKey: 'notOwner' };
            }

            const report = await executeSafeTransaction({
                protocolKit,
                safeTransaction,
                safeTxHash,
                safeAddress,
                chainId,
                signatures: live.confirmations.map(
                    ({ owner, signature, signatureType }) =>
                        new EthSafeSignature(
                            owner,
                            signature,
                            signatureType === 'CONTRACT_SIGNATURE',
                        ),
                ),
            });

            outcome = classifyReport(report, transaction.safeTxHash);

            return outcome;
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    safeAddress,
                    safeTxHash: transaction.safeTxHash,
                    operation: 'safe_execute_transaction',
                },
            });
            outcome = {
                status: 'error',
                messageKey: 'error',
                safeTxHash: transaction.safeTxHash,
            };

            return outcome;
        } finally {
            setIsExecuting(false);

            // Only an outcome that actually spent the nonce leaves the queue, so only those are
            // worth waiting for. A refusal decided before sending — not an owner, wrong nonce,
            // stale queue — leaves the transaction exactly where it was, so reconciling would
            // spend every delay against a rate-limited service and hold the rest of the Safe's
            // state behind a loop that can never settle. An outer revert rolls the nonce back,
            // so it belongs with the refusals.
            const hasLeftQueue =
                outcome?.status === 'executed' ||
                outcome?.messageKey === 'innerFailed' ||
                outcome?.messageKey === 'unconfirmed';

            if (hasLeftQueue) {
                // Detached and never fatal: the receipt is already classified, so a failed re-read
                // must not turn a sent transaction into an error.
                void reconcileExecution(transaction.safeTxHash);
            } else {
                invalidateSafeState();
            }
        }
    };

    return {
        confirm,
        isConfirming,
        confirmError,
        submittedConfirmations,
        confirmationSyncTimedOut,
        refreshQueue,
        execute,
        isExecuting,
    };
};
