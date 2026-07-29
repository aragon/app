import dynamic from 'next/dynamic';

export const AragonProfileRenameDialog = dynamic(() =>
    import('./aragonProfileRenameDialog').then(
        (mod) => mod.AragonProfileRenameDialog,
    ),
);

export type {
    IAragonProfileRenameDialogParams,
    IAragonProfileRenameDialogProps,
} from './aragonProfileRenameDialog';
