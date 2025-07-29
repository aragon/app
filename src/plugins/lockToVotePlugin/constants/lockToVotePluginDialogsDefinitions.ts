import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { LockToVoteSubmitVoteFeedbackDialog } from '../dialogs/lockToVoteSubmitVoteFeedbackDialog';
import { LockToVotePluginDialogId } from './lockToVotePluginDialogId';

export const lockToVotePluginDialogsDefinitions: Record<LockToVotePluginDialogId, IDialogComponentDefinitions> = {
    [LockToVotePluginDialogId.SUBMIT_VOTE_FEEDBACK]: {
        Component: LockToVoteSubmitVoteFeedbackDialog,
    },
};
