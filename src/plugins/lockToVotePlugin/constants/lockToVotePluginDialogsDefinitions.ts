import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { LockToVotePluginDialogId } from './lockToVotePluginDialogId';

export const lockToVotePluginDialogsDefinitions: Record<
    LockToVotePluginDialogId,
    IDialogComponentDefinitions
> = {
    [LockToVotePluginDialogId.SUBMIT_VOTE_FEEDBACK]: {
        Component: dynamic(() =>
            import('../dialogs/lockToVoteSubmitVoteFeedbackDialog').then(
                (m) => m.LockToVoteSubmitVoteFeedbackDialog,
            ),
        ),
        hiddenTitle:
            'app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.a11y.title',
        hiddenDescription:
            'app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.a11y.description',
    },
    [LockToVotePluginDialogId.LOCK_BEFORE_VOTE]: {
        Component: dynamic(() =>
            import('../dialogs/lockToVoteLockBeforeVoteDialog').then(
                (m) => m.LockToVoteLockBeforeVoteDialog,
            ),
        ),
        hiddenDescription:
            'app.plugins.lockToVote.lockToVoteLockBeforeVoteDialog.a11y.description',
    },
    [LockToVotePluginDialogId.LOCK_UNLOCK_L2V]: {
        Component: dynamic(() =>
            import('../dialogs/lockToVoteLockUnlockDialog').then(
                (m) => m.LockToVoteLockUnlockDialog,
            ),
        ),
    },
    [LockToVotePluginDialogId.UNLOCK_BLOCKED_INFO]: {
        Component: dynamic(() =>
            import('../dialogs/unlockBlockedInfoDialog').then(
                (m) => m.UnlockBlockedInfoDialog,
            ),
        ),
        hiddenDescription:
            'app.plugins.lockToVote.unlockBlockedInfoDialog.a11y.description',
    },
    [LockToVotePluginDialogId.LOCK_ONBOARDING_INTRO_L2V]: {
        Component: dynamic(() =>
            import('../dialogs/lockToVoteLockOnboardingIntroDialog').then(
                (m) => m.LockToVoteLockOnboardingIntroDialog,
            ),
        ),
        hiddenTitle:
            'app.plugins.lockToVote.lockToVoteLockOnboardingDialog.intro.hiddenTitle',
    },
    [LockToVotePluginDialogId.LOCK_ONBOARDING_FORM_L2V]: {
        Component: dynamic(() =>
            import('../dialogs/lockToVoteLockOnboardingFormDialog').then(
                (m) => m.LockToVoteLockOnboardingFormDialog,
            ),
        ),
    },
};
