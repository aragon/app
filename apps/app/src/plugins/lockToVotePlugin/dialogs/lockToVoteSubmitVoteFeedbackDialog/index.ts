import dynamic from 'next/dynamic';

export const LockToVoteSubmitVoteFeedbackDialog = dynamic(() =>
    import('./lockToVoteSubmitVoteFeedbackDialog').then(
        (mod) => mod.LockToVoteSubmitVoteFeedbackDialog,
    ),
);

export type {
    ILockToVoteSubmitVoteFeedbackDialogParams,
    ILockToVoteSubmitVoteFeedbackDialogProps,
} from './lockToVoteSubmitVoteFeedbackDialog';
