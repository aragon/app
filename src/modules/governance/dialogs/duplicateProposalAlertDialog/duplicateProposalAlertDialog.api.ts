import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

export interface IDuplicateProposalAlertDialogParams {
    /**
     * Callback invoked when the user chooses to create another proposal despite one already being
     * in flight. Opens the publish dialog for the new proposal.
     */
    onProceed: () => void;
}

export interface IDuplicateProposalAlertDialogProps
    extends IDialogComponentProps<IDuplicateProposalAlertDialogParams> {}
