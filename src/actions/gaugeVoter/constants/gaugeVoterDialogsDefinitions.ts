import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeVoterDialogId } from './gaugeVoterDialogId';

export const gaugeVoterDialogsDefinitions: Record<
    GaugeVoterDialogId,
    IDialogComponentDefinitions
> = {
    [GaugeVoterDialogId.SELECT_GAUGE]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeVoterSelectGaugeDialog').then(
                (m) => m.GaugeVoterSelectGaugeDialog,
            ),
        ),
    },
};
