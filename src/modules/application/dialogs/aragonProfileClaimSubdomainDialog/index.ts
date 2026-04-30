import dynamic from 'next/dynamic';

export const AragonProfileClaimSubdomainDialog = dynamic(() =>
    import('./aragonProfileClaimSubdomainDialog').then(
        (mod) => mod.AragonProfileClaimSubdomainDialog,
    ),
);

export type {
    IAragonProfileClaimSubdomainDialogParams,
    IAragonProfileClaimSubdomainDialogProps,
} from './aragonProfileClaimSubdomainDialog';
