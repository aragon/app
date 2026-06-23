import { useCallback, useEffect, useRef, useState } from 'react';
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
    /**
     * Approve-step display state derived from the managed wallet status (`success` once a hash exists).
     */
    approveState: TransactionStatusState;
    /**
     * Transaction hash, latched so it survives the record being cleared on confirmation.
     */
    hash?: Hex;
    /**
     * Step to resume to when a prior attempt for this action is still in flight on open; computed
     * once, synchronously, so there is no effect-ordering race.
     */
    resumeTarget?: TransactionDialogStep;
    /**
     * The `useWaitForTransactionReceipt` result for the (latched) hash.
     */
    receipt: UseWaitForTransactionReceiptReturnType;
    /**
     * Dispatch the request to the wallet through the manager (survives the dialog closing).
     */
    send: (request: ManagedRequest) => void;
    /**
     * Re-send the last request for a resumed action (whose dialog has no freshly-built transaction).
     * Returns false when there is no stored request to re-send.
     */
    resend: () => boolean;
}

// On open, decide where a prior attempt left off: SUBMITTED -> confirm (on the hash, survives a
// reload), a live PENDING -> sign. Anything else means start fresh.
const resolveResumeTarget = (
    intentId: string,
): TransactionDialogStep | undefined => {
    const status = pendingTransactionManager.get(intentId)?.status;
    if (status === PendingTransactionStatus.SUBMITTED) {
        return TransactionDialogStep.CONFIRM;
    }
    if (
        status === PendingTransactionStatus.PENDING &&
        !pendingTransactionManager.isInterrupted(intentId)
    ) {
        return TransactionDialogStep.APPROVE;
    }
    return undefined;
};

export const useManagedTransaction = (
    intentId: string,
): IUseManagedTransactionResult => {
    const managed = usePendingTransaction(intentId);

    // Latch the hash so the confirm/index steps keep working after the record is cleared on confirm.
    const [latchedHash, setLatchedHash] = useState<Hex>();
    useEffect(() => {
        if (managed?.hash != null) {
            setLatchedHash(managed.hash);
        }
    }, [managed?.hash]);
    const hash = latchedHash ?? managed?.hash;

    const [resumeTarget] = useState(() => resolveResumeTarget(intentId));

    // A stale record (reloaded/interrupted PENDING, or a prior FAILED) is dropped once on open so the
    // run starts clean. Guarded so a fresh send made later in this session is never cleared.
    const staleCleared = useRef(false);
    useEffect(() => {
        if (staleCleared.current) {
            return;
        }
        staleCleared.current = true;
        if (
            resumeTarget == null &&
            pendingTransactionManager.get(intentId) != null
        ) {
            pendingTransactionManager.clear(intentId);
        }
    }, [intentId, resumeTarget]);

    const receipt = useWaitForTransactionReceipt({ hash });

    // Confirmed — clear the record so a re-open starts fresh; the latch keeps the hash for display.
    useEffect(() => {
        if (receipt.status === 'success') {
            pendingTransactionManager.clear(intentId);
        }
    }, [receipt.status, intentId]);

    // A new send forgets the previous hash, so the advance effect can't see a stale one and jump
    // straight to confirm on the old transaction.
    const send = useCallback(
        (request: ManagedRequest) => {
            setLatchedHash(undefined);
            pendingTransactionManager.send(intentId, request);
        },
        [intentId],
    );

    const resend = useCallback(() => {
        const request = pendingTransactionManager.getRequest(intentId);
        if (request == null) {
            return false;
        }
        setLatchedHash(undefined);
        pendingTransactionManager.send(intentId, request);
        return true;
    }, [intentId]);

    const approveState =
        hash != null
            ? 'success'
            : match(managed?.status)
                  .returnType<TransactionStatusState>()
                  .with(PendingTransactionStatus.PENDING, () => 'pending')
                  .with(PendingTransactionStatus.FAILED, () => 'error')
                  .otherwise(() => 'idle');

    return { approveState, hash, resumeTarget, receipt, send, resend };
};
