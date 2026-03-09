import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeVoterExitQueueWithdrawDialog } from '../dialogs/gaugeVoterExitQueueWithdrawDialog';
import { GaugeVoterExitQueueWithdrawTransactionDialog } from '../dialogs/gaugeVoterExitQueueWithdrawTransactionDialog';
import { GaugeVoterGaugeDetailsDialog } from '../dialogs/gaugeVoterGaugeDetailsDialog';
import { GaugeVoterLockOnboardingIntroDialog } from '../dialogs/gaugeVoterLockOnboardingIntroDialog';
import { GaugeVoterLockOnboardingLockTimeInfoDialog } from '../dialogs/gaugeVoterLockOnboardingLockTimeInfoDialog';
import { GaugeVoterLocksDialog } from '../dialogs/gaugeVoterLocksDialog';
import { GaugeVoterLockUnlockDialog } from '../dialogs/gaugeVoterLockUnlockDialog';
import { GaugeVoterVoteDialog } from '../dialogs/gaugeVoterVoteDialog';
import { GaugeVoterVoteTransactionDialog } from '../dialogs/gaugeVoterVoteTransactionDialog';
import { GaugeVoterPluginDialogId } from './gaugeVoterPluginDialogId';

export const gaugeVoterPluginDialogsDefinitions: Record<
    GaugeVoterPluginDialogId,
    IDialogComponentDefinitions
> = {
    [GaugeVoterPluginDialogId.GAUGE_DETAILS]: {
        Component: GaugeVoterGaugeDetailsDialog,
        size: 'lg',
        hiddenDescription:
            'plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.a11y.description',
    },
    [GaugeVoterPluginDialogId.VOTE_GAUGES]: {
        Component: GaugeVoterVoteDialog,
        size: 'xl',
        hiddenDescription:
            'plugins.gaugeVoter.gaugeVoterVoteDialog.a11y.description',
    },
    [GaugeVoterPluginDialogId.VOTE_GAUGES_TRANSACTION]: {
        Component: GaugeVoterVoteTransactionDialog,
        size: 'md',
    },
    [GaugeVoterPluginDialogId.LOCK_UNLOCK]: {
        Component: GaugeVoterLockUnlockDialog,
    },
    [GaugeVoterPluginDialogId.VIEW_LOCKS]: {
        Component: GaugeVoterLocksDialog,
    },
    [GaugeVoterPluginDialogId.EXIT_QUEUE_WITHDRAW_FEE]: {
        Component: GaugeVoterExitQueueWithdrawDialog,
    },
    [GaugeVoterPluginDialogId.EXIT_QUEUE_WITHDRAW_TRANSACTION]: {
        Component: GaugeVoterExitQueueWithdrawTransactionDialog,
    },
    [GaugeVoterPluginDialogId.LOCK_ONBOARDING_INTRO]: {
        Component: GaugeVoterLockOnboardingIntroDialog,
        hiddenTitle:
            'app.plugins.gaugeVoter.gaugeVoterLockOnboardingDialog.intro.hiddenTitle',
    },
    [GaugeVoterPluginDialogId.LOCK_ONBOARDING_LOCK_TIME_INFO]: {
        Component: GaugeVoterLockOnboardingLockTimeInfoDialog,
    },
};
