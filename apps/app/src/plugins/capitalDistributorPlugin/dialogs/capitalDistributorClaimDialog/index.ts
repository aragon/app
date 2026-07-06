import dynamic from 'next/dynamic';

export const CapitalDistributorClaimDialog = dynamic(() =>
    import('./capitalDistributorClaimDialog').then(
        (mod) => mod.CapitalDistributorClaimDialog,
    ),
);

export type {
    ICapitalDistributorClaimDialogParams,
    ICapitalDistributorClaimDialogProps,
} from './capitalDistributorClaimDialog';
