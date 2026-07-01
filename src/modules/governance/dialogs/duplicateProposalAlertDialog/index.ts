import dynamic from 'next/dynamic';

export const DuplicateProposalAlertDialog = dynamic(() =>
    import('./duplicateProposalAlertDialog').then(
        (mod) => mod.DuplicateProposalAlertDialog,
    ),
);
export type {
    IDuplicateProposalAlertDialogParams,
    IDuplicateProposalAlertDialogProps,
} from './duplicateProposalAlertDialog.api';
