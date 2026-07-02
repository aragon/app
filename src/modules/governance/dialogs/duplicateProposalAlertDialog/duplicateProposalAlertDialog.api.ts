import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

export interface IDuplicatePendingProposal {
    /**
     * Title of the in-flight proposal, if it was recorded with the pending transaction.
     */
    title?: string;
    /**
     * Whether the transaction is still awaiting the wallet signature or has already been broadcast.
     */
    status: 'pending' | 'submitted';
    /**
     * Block-explorer link to the broadcast transaction, when a hash is available (submitted state).
     */
    transactionUrl?: string;
    /**
     * Reopen the in-flight proposal's dialog to resume it. Session-scoped, so it is absent after a
     * page reload (the dialog then shows details + transaction link only).
     */
    onReturn?: () => void;
}

export interface IDuplicateProposalAlertDialogParams {
    /**
     * "Publish anyway": supersede the in-flight creation(s) and open the publish dialog for the new
     * proposal.
     */
    onProceed: () => void;
    /**
     * In-flight proposal creation(s) for the same DAO + plugin that conflict with the new submission.
     */
    pending: IDuplicatePendingProposal[];
}

export interface IDuplicateProposalAlertDialogProps
    extends IDialogComponentProps<IDuplicateProposalAlertDialogParams> {}
