import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeVoterGaugeDetailsDialog } from '../dialogs/gaugeVoterGaugeDetailsDialog';
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
};
