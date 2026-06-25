import { useCallback, useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import type { Hex } from 'viem';
import {
    type UseWaitForTransactionReceiptReturnType,
    useWaitForTransactionReceipt,
} from 'wagmi';
import { usePendingTransaction } from '@/shared/hooks/usePendingTransaction';
import {
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { TransactionStatusState } from '../transactionStatus';
import { TransactionDialogStep } from './transactionDialog.api';

type ManagedRequest = ITransactionRequest & { chainId: number };

export interface IUseManagedTransactionResult {
    /** Approve-step display state; `success` once a hash exists. */
    approveState: TransactionStatusState;
    /** Transaction hash, latched so it survives the record being cleared. */
    hash?: Hex;
    /** Step to resume to when a prior attempt is still in flight on open. */
    resumeTarget?: TransactionDialogStep;
    /** `useWaitForTransactionReceipt` result for the latched hash. */
    receipt: UseWaitForTransactionReceiptReturnType;
    /** Send the request to the wallet via the manager. */
    send: (request: ManagedRequest) => void;
    /** Re-send the last stored request. Returns false when there is none. */
    resend: () => boolean;
}

/**
 * Binds the dialog to the pending-transaction manager for one action identity. `intentId` is
 * optional and may arrive late (auto-derived after `prepare`); state is neutral until it is known.
 */
export const useManagedTransaction = (
    intentId?: string,
): IUseManagedTransactionResult => {
    const managed = usePendingTransaction(intentId);

    // The record is cleared on confirmation, so latch the hash that later steps and the link need.
    const [latchedHash, setLatchedHash] = useState<Hex>();
    useEffect(() => {
        if (managed?.hash != null) {
            setLatchedHash(managed.hash);
        }
    }, [managed?.hash]);
    const hash = latchedHash ?? managed?.hash;

    // Resume where a prior attempt left off, re-read on each identity change so it can't go stale:
    // SUBMITTED -> confirm, live PENDING -> sign. A stale record (interrupted PENDING / prior FAILED)
    // is cleared so the run starts fresh.
    const [resumeTarget, setResumeTarget] = useState<TransactionDialogStep>();
    useEffect(() => {
        if (intentId == null) {
            return;
        }

        const status = pendingTransactionManager.get(intentId)?.status;
        if (status === PendingTransactionStatus.SUBMITTED) {
            setResumeTarget(TransactionDialogStep.CONFIRM);
        } else if (
            status === PendingTransactionStatus.PENDING &&
            !pendingTransactionManager.isInterrupted(intentId)
        ) {
            setResumeTarget(TransactionDialogStep.APPROVE);
        } else if (status != null) {
            pendingTransactionManager.clear(intentId);
        }
    }, [intentId]);

    const receipt = useWaitForTransactionReceipt({ hash });

    // Confirmed — clear the record so a re-open starts fresh; the latch keeps the hash for display.
    useEffect(() => {
        if (receipt.status === 'success' && intentId != null) {
            pendingTransactionManager.clear(intentId);
        }
    }, [receipt.status, intentId]);

    // Forget the previous hash so the advance effect can't jump to confirm on a stale one.
    const send = useCallback(
        (request: ManagedRequest) => {
            if (intentId == null) {
                return;
            }
            setLatchedHash(undefined);
            pendingTransactionManager.send(intentId, request);
        },
        [intentId],
    );

    const resend = useCallback(() => {
        if (intentId == null) {
            return false;
        }
        const request = pendingTransactionManager.getRequest(intentId);
        if (request == null) {
            return false;
        }
        setLatchedHash(undefined);
        pendingTransactionManager.send(intentId, request);
        return true;
    }, [intentId]);

    // A latched hash means the send succeeded (the record may already be cleared), so it wins.
    const approveState: TransactionStatusState =
        hash != null
            ? 'success'
            : match(managed?.status)
                  .returnType<TransactionStatusState>()
                  .with(PendingTransactionStatus.PENDING, () => 'pending')
                  .with(PendingTransactionStatus.SUBMITTED, () => 'success')
                  .with(PendingTransactionStatus.FAILED, () => 'error')
                  .with(undefined, () => 'idle')
                  .exhaustive();

    return { approveState, hash, resumeTarget, receipt, send, resend };
};
