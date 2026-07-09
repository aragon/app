import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

export interface IDuplicateProposalAlertDialogParams {
    /**
     * "New transaction": supersede the in-flight creation(s) and open the publish dialog for the new
     * proposal.
     */
    onProceed: () => void;
    /**
     * Reopen the conflicting in-flight transaction's dialog to resume it. Absent when it can no longer
     * be reopened (e.g. after a page reload), in which case the warning only offers to dismiss.
     */
    onResume?: () => void;
}

export interface IDuplicateProposalAlertDialogProps
    extends IDialogComponentProps<IDuplicateProposalAlertDialogParams> {}
