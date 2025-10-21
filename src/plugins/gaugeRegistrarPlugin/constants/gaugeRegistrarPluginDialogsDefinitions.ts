import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { GaugeRegistrarSelectGaugeDialog } from '../dialogs/gaugeRegistrarSelectGaugeDialog';
import { GaugeRegistrarPluginDialogId } from './gaugeRegistrarPluginDialogId';

export const gaugeRegistrarPluginDialogsDefinitions: Record<
    GaugeRegistrarPluginDialogId,
    IDialogComponentDefinitions
> = {
    [GaugeRegistrarPluginDialogId.SELECT_GAUGE]: { Component: GaugeRegistrarSelectGaugeDialog },
};
