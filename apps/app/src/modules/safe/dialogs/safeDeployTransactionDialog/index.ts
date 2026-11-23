import dynamic from 'next/dynamic';

export const SafeDeployTransactionDialog = dynamic(() =>
    import('./safeDeployTransactionDialog').then(
        (mod) => mod.SafeDeployTransactionDialog,
    ),
);
export type {
    ISafeDeployTransactionDialogCreatedSafe,
    ISafeDeployTransactionDialogParams,
    ISafeDeployTransactionDialogProps,
} from './safeDeployTransactionDialog';
