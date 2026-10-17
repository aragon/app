import dynamic from 'next/dynamic';

export const SafeTransactionReviewDialog = dynamic(() =>
    import('./safeTransactionReviewDialog').then(
        (mod) => mod.SafeTransactionReviewDialog,
    ),
);
export type {
    ISafeTransactionReviewDialogParams,
    ISafeTransactionReviewDialogProps,
} from './safeTransactionReviewDialog';
