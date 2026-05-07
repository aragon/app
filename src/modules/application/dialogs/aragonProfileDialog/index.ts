import dynamic from 'next/dynamic';

export const AragonProfileDialog = dynamic(() =>
    import('./aragonProfileDialog').then((mod) => mod.AragonProfileDialog),
);

export type {
    IAragonProfileDialogParams,
    IAragonProfileDialogProps,
} from './aragonProfileDialog';
