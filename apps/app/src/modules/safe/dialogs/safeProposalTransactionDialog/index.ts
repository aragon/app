import dynamic from 'next/dynamic';

export const SafeProposalTransactionDialog = dynamic(() =>
    import('./safeProposalTransactionDialog').then(
        (mod) => mod.SafeProposalTransactionDialog,
    ),
);
export type {
    ISafeProposalTransactionDialogParams,
    ISafeProposalTransactionDialogProps,
} from './safeProposalTransactionDialog';
