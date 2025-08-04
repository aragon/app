import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { LockToVoteLockBeforeVoteDialog } from '../dialogs/lockToVoteLockBeforeVoteDialog';
import { LockToVoteLockUnlockDialog } from '../dialogs/lockToVoteLockUnlockDialog';
import { LockToVoteSubmitVoteFeedbackDialog } from '../dialogs/lockToVoteSubmitVoteFeedbackDialog';
import { LockToVotePluginDialogId } from './lockToVotePluginDialogId';

export const lockToVotePluginDialogsDefinitions: Record<LockToVotePluginDialogId, IDialogComponentDefinitions> = {
    [LockToVotePluginDialogId.SUBMIT_VOTE_FEEDBACK]: { Component: LockToVoteSubmitVoteFeedbackDialog },
    [LockToVotePluginDialogId.LOCK_BEFORE_VOTE]: { Component: LockToVoteLockBeforeVoteDialog },
    [LockToVotePluginDialogId.LOCK_UNLOCK]: { Component: LockToVoteLockUnlockDialog },
};
