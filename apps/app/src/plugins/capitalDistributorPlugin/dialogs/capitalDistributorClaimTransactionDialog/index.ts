import dynamic from 'next/dynamic';

export const CapitalDistributorClaimTransactionDialog = dynamic(() =>
    import('./capitalDistributorClaimTransactionDialog').then(
        (mod) => mod.CapitalDistributorClaimTransactionDialog,
    ),
);

export type {
    ICapitalDistributorClaimTransactionDialogParams,
    ICapitalDistributorClaimTransactionDialogProps,
} from './capitalDistributorClaimTransactionDialog';
