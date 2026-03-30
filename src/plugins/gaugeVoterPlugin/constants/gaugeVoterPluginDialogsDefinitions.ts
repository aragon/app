import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeVoterPluginDialogId } from './gaugeVoterPluginDialogId';

export const gaugeVoterPluginDialogsDefinitions: Record<
    GaugeVoterPluginDialogId,
    IDialogComponentDefinitions
> = {
    [GaugeVoterPluginDialogId.GAUGE_DETAILS]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterGaugeDetailsDialog').then(
                (m) => m.GaugeVoterGaugeDetailsDialog,
            ),
        ),
        size: 'lg',
        hiddenDescription:
            'plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.a11y.description',
    },
    [GaugeVoterPluginDialogId.VOTE_GAUGES]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterVoteDialog').then(
                (m) => m.GaugeVoterVoteDialog,
            ),
        ),
        size: 'xl',
        hiddenDescription:
            'plugins.gaugeVoter.gaugeVoterVoteDialog.a11y.description',
    },
    [GaugeVoterPluginDialogId.VOTE_GAUGES_TRANSACTION]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterVoteTransactionDialog').then(
                (m) => m.GaugeVoterVoteTransactionDialog,
            ),
        ),
        size: 'md',
    },
    [GaugeVoterPluginDialogId.LOCK_UNLOCK]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterLockUnlockDialog').then(
                (m) => m.GaugeVoterLockUnlockDialog,
            ),
        ),
    },
    [GaugeVoterPluginDialogId.VIEW_LOCKS]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterLocksDialog').then(
                (m) => m.GaugeVoterLocksDialog,
            ),
        ),
    },
    [GaugeVoterPluginDialogId.EXIT_QUEUE_WITHDRAW_FEE]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterExitQueueWithdrawDialog').then(
                (m) => m.GaugeVoterExitQueueWithdrawDialog,
            ),
        ),
    },
    [GaugeVoterPluginDialogId.EXIT_QUEUE_WITHDRAW_TRANSACTION]: {
        Component: dynamic(() =>
            import(
                '../dialogs/gaugeVoterExitQueueWithdrawTransactionDialog'
            ).then((m) => m.GaugeVoterExitQueueWithdrawTransactionDialog),
        ),
    },
    [GaugeVoterPluginDialogId.LOCK_ONBOARDING_INTRO]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterLockOnboardingIntroDialog').then(
                (m) => m.GaugeVoterLockOnboardingIntroDialog,
            ),
        ),
        hiddenTitle:
            'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.intro.hiddenTitle',
    },
    [GaugeVoterPluginDialogId.LOCK_ONBOARDING_LOCK_TIME_INFO]: {
        Component: dynamic(() =>
            import(
                '../dialogs/gaugeVoterLockOnboardingLockTimeInfoDialog'
            ).then((m) => m.GaugeVoterLockOnboardingLockTimeInfoDialog),
        ),
    },
    [GaugeVoterPluginDialogId.LOCK_ONBOARDING_FORM]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterLockOnboardingFormDialog').then(
                (m) => m.GaugeVoterLockOnboardingFormDialog,
            ),
        ),
    },
};
