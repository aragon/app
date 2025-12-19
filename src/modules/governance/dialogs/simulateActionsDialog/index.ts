import dynamic from 'next/dynamic';

export const SimulateActionsDialog = dynamic(() =>
    import('./simulateActionsDialog').then((mod) => mod.SimulateActionsDialog),
);
export type {
    ISimulateActionsDialogParams,
    ISimulateActionsDialogProps,
} from './simulateActionsDialog';
