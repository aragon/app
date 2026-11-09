import type {
    ISafeInfo,
    ISafeMultisigTransaction,
} from '@/shared/api/safeService';
import type { IWorkspaceAccountRef } from './workspaceAccountInfo';
import type { IWorkspaceCoverage } from './workspaceCoverage';
import type { IWorkspaceProposal } from './workspaceProposal';

/**
 * An active proposal the wallet can vote on and has not voted on yet.
 */
export interface IWorkspaceTodoProposal extends IWorkspaceProposal {
    /**
     * When the wallet's vote window closes, in seconds. The current stage's end for a process proposal, whose own
     * end date is unknown until its last stage.
     */
    voteEndDate: number;
}

/**
 * A live Safe transaction the wallet owns a signature on and has not confirmed yet.
 */
export interface IWorkspaceTodoTransaction {
    /**
     * Identifier of the stored transaction.
     */
    id: string;
    /**
     * Safe account the transaction is queued on.
     */
    account: IWorkspaceAccountRef;
    /**
     * Current nonce, threshold and version of the Safe, read from the chain. Null when that read failed; the
     * queued rows are still served from the store.
     */
    safe: Pick<ISafeInfo, 'nonce' | 'threshold' | 'version'> | null;
    /**
     * Another live transaction of the same Safe holds this nonce, so at most one of them can ever execute.
     */
    hasNonceRival: boolean;
    /**
     * The queued transaction, as the Safe queue endpoint serves it.
     */
    transaction: ISafeMultisigTransaction;
}

/**
 * What the wallet can still act on across the accounts of a workspace.
 *
 * Both lists are computed by the backend from its stored rows and capped at 50. The proposals come with the same
 * shape as the workspace proposal list plus the end of their vote window; they are the ones whose window is open
 * and the wallet is a member of, minus the ones it voted on. The process plugin's own status is still the final
 * word on "active", which the reader applies on top.
 */
export interface IWorkspaceTodoResponse {
    /**
     * Active proposals the wallet can vote on and has not voted on, newest first.
     */
    proposals: IWorkspaceTodoProposal[];
    /**
     * Live Safe transactions of the owned Safes the wallet has not confirmed, in account order then by nonce.
     */
    transactions: IWorkspaceTodoTransaction[];
    /**
     * Per-account report of whether each source could be read.
     */
    coverage: IWorkspaceCoverage[];
    /**
     * True when any coverage entry is not available.
     */
    partial: boolean;
}
