import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeVoterGaugeDetailsDialog } from '../dialogs/gaugeVoterGaugeDetailsDialog';
import { GaugeVoterVoteDialog } from '../dialogs/gaugeVoterVoteDialog';
import { GaugeVoterPluginDialogId } from './gaugeVoterPluginDialogId';

export const gaugeVoterPluginDialogsDefinitions: Record<GaugeVoterPluginDialogId, IDialogComponentDefinitions> = {
    [GaugeVoterPluginDialogId.GAUGE_DETAILS]: { Component: GaugeVoterGaugeDetailsDialog, size: 'lg' },
    [GaugeVoterPluginDialogId.VOTE_GAUGES]: { Component: GaugeVoterVoteDialog, size: 'xl' },
};
