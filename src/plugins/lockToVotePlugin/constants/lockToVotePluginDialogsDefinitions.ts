import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { LockToVoteLockTokensDialog } from '../dialogs/lockToVoteLockTokensDialog';
import { LockToVoteSubmitVoteFeedbackDialog } from '../dialogs/lockToVoteSubmitVoteFeedbackDialog';
import { LockToVotePluginDialogId } from './lockToVotePluginDialogId';

export const lockToVotePluginDialogsDefinitions: Record<LockToVotePluginDialogId, IDialogComponentDefinitions> = {
    [LockToVotePluginDialogId.SUBMIT_VOTE_FEEDBACK]: { Component: LockToVoteSubmitVoteFeedbackDialog },
    [LockToVotePluginDialogId.LOCK_TOKENS]: { Component: LockToVoteLockTokensDialog },
};
