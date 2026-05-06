import dynamic from 'next/dynamic';

export const AragonProfileSubdomainRegisterTransactionDialog = dynamic(() =>
    import('./aragonProfileSubdomainRegisterTransactionDialog').then(
        (mod) => mod.AragonProfileSubdomainRegisterTransactionDialog,
    ),
);

export type {
    IAragonProfileSubdomainRegisterTransactionDialogParams,
    IAragonProfileSubdomainRegisterTransactionDialogProps,
} from './aragonProfileSubdomainRegisterTransactionDialog';
