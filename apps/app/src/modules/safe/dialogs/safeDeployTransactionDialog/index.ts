import dynamic from 'next/dynamic';

export const SafeDeployTransactionDialog = dynamic(() =>
    import('./safeDeployTransactionDialog').then(
        (mod) => mod.SafeDeployTransactionDialog,
    ),
);
export type {
    ISafeDeployedSafe,
    ISafeDeployTransactionDialogParams,
    ISafeDeployTransactionDialogProps,
} from './safeDeployTransactionDialog';
