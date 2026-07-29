import dynamic from 'next/dynamic';

export const DispatchDialog = dynamic(() =>
    import('./dispatchDialog').then((mod) => mod.DispatchDialog),
);

export const DispatchSimulationDialog = dynamic(() =>
    import('./dispatchSimulationDialog').then(
        (mod) => mod.DispatchSimulationDialog,
    ),
);

export const DispatchTransactionDialog = dynamic(() =>
    import('./dispatchTransactionDialog').then(
        (mod) => mod.DispatchTransactionDialog,
    ),
);

export type {
    IDispatchDialogParams,
    IDispatchDialogProps,
} from './dispatchDialog';
export type {
    IDispatchSimulationDialogParams,
    IDispatchSimulationDialogProps,
} from './dispatchSimulationDialog';
export type {
    IDispatchTransactionDialogParams,
    IDispatchTransactionDialogProps,
} from './dispatchTransactionDialog';
