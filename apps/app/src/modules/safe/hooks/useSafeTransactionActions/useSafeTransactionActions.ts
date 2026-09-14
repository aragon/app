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
    safeService,
    safeServiceKeys,
    useConfirmSafeTransaction,
} from '@/shared/api/safeService';
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
 */
export type ISafeExecutionActionOutcome =
    | { status: 'executed'; hash: string }
    | { status: 'error'; messageKey: string; hash?: string };

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
): ISafeExecutionActionOutcome => {
    if (report.result === SafeExecutionResult.EXECUTED) {
        return { status: 'executed', hash: report.hash };
    }

    if (report.result === SafeExecutionResult.AUTHORITY_CHANGED) {
        return { status: 'error', messageKey: 'authorityChanged' };
    }

    if (report.result === SafeExecutionResult.REJECTED) {
        return { status: 'error', messageKey: 'rejected' };
    }

    if (report.result === SafeExecutionResult.FAILED) {
        return {
            status: 'error',
            messageKey: executionOutcomeKeys[report.outcome],
            hash: report.hash,
        };
    }

    // EFFECT_MISSING: reachable only with a `verifyEffect`, which the account path never passes.
    // Treated as unconfirmed rather than trusted as done.
    return { status: 'error', messageKey: 'unconfirmed' };
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

            // Never awaited and never fatal: the signature is already stored by the service, and
            // reporting a failed cache refresh as a failed confirmation would re-prompt the owner
            // for a signature the Safe already holds.
            refreshQueue();
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    safeAddress,
                    safeTxHash: transaction.safeTxHash,
                    operation: 'safe_confirm_transaction',
                },
            });
            setConfirmError('error');
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

            return classifyReport(report);
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    safeAddress,
                    safeTxHash: transaction.safeTxHash,
                    operation: 'safe_execute_transaction',
                },
            });
            return { status: 'error', messageKey: 'error' };
        } finally {
            setIsExecuting(false);
            invalidateSafeState();
        }
    };

    return { confirm, isConfirming, confirmError, execute, isExecuting };
};
