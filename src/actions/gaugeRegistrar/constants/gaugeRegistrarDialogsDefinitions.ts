import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeRegistrarDialogId } from './gaugeRegistrarDialogId';

export const gaugeRegistrarDialogsDefinitions: Record<
    GaugeRegistrarDialogId,
    IDialogComponentDefinitions
> = {
    [GaugeRegistrarDialogId.SELECT_GAUGE]: {
        Component: dynamic(() =>
            import('../dialogs/gaugeRegistrarSelectGaugeDialog').then(
                (m) => m.GaugeRegistrarSelectGaugeDialog,
            ),
        ),
    },
};
