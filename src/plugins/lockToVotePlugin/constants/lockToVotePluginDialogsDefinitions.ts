import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { LockToVoteLockBeforeVoteDialog } from '../dialogs/lockToVoteLockBeforeVoteDialog';
import { LockToVoteLockOnboardingFormDialog } from '../dialogs/lockToVoteLockOnboardingFormDialog';
import { LockToVoteLockOnboardingIntroDialog } from '../dialogs/lockToVoteLockOnboardingIntroDialog';
import { LockToVoteLockUnlockDialog } from '../dialogs/lockToVoteLockUnlockDialog';
import { LockToVoteSubmitVoteFeedbackDialog } from '../dialogs/lockToVoteSubmitVoteFeedbackDialog';
import { UnlockBlockedInfoDialog } from '../dialogs/unlockBlockedInfoDialog';
import { LockToVotePluginDialogId } from './lockToVotePluginDialogId';

export const lockToVotePluginDialogsDefinitions: Record<
    LockToVotePluginDialogId,
    IDialogComponentDefinitions
> = {
    [LockToVotePluginDialogId.SUBMIT_VOTE_FEEDBACK]: {
        Component: LockToVoteSubmitVoteFeedbackDialog,
        hiddenTitle:
            'app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.a11y.title',
        hiddenDescription:
            'app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.a11y.description',
    },
    [LockToVotePluginDialogId.LOCK_BEFORE_VOTE]: {
        Component: LockToVoteLockBeforeVoteDialog,
        hiddenDescription:
            'app.plugins.lockToVote.lockToVoteLockBeforeVoteDialog.a11y.description',
    },
    [LockToVotePluginDialogId.LOCK_UNLOCK_L2V]: {
        Component: LockToVoteLockUnlockDialog,
    },
    [LockToVotePluginDialogId.UNLOCK_BLOCKED_INFO]: {
        Component: UnlockBlockedInfoDialog,
        hiddenDescription:
            'app.plugins.lockToVote.unlockBlockedInfoDialog.a11y.description',
    },
    [LockToVotePluginDialogId.LOCK_ONBOARDING_INTRO_L2V]: {
        Component: LockToVoteLockOnboardingIntroDialog,
        hiddenTitle:
            'app.plugins.lockToVote.lockToVoteLockOnboardingDialog.intro.hiddenTitle',
    },
    [LockToVotePluginDialogId.LOCK_ONBOARDING_FORM_L2V]: {
        Component: LockToVoteLockOnboardingFormDialog,
    },
};
