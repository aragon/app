import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeRegistrarSelectGaugeDialog } from '../dialogs/gaugeRegistrarSelectGaugeDialog';
import { GaugeRegistrarDialogId } from './gaugeRegistrarDialogId';

export const gaugeRegistrarDialogsDefinitions: Record<GaugeRegistrarDialogId, IDialogComponentDefinitions> = {
    [GaugeRegistrarDialogId.SELECT_GAUGE]: {
        Component: GaugeRegistrarSelectGaugeDialog,
    },
};
