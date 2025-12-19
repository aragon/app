import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeVoterSelectGaugeDialog } from '../dialogs/gaugeVoterSelectGaugeDialog';
import { GaugeVoterDialogId } from './gaugeVoterDialogId';

export const gaugeVoterDialogsDefinitions: Record<
    GaugeVoterDialogId,
    IDialogComponentDefinitions
> = {
    [GaugeVoterDialogId.SELECT_GAUGE]: {
        Component: GaugeVoterSelectGaugeDialog,
    },
};
