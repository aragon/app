import dynamic from 'next/dynamic';

export const AragonProfileReleaseAlertDialog = dynamic(() =>
    import('./aragonProfileReleaseAlertDialog').then(
        (mod) => mod.AragonProfileReleaseAlertDialog,
    ),
);

export type {
    IAragonProfileReleaseAlertDialogParams,
    IAragonProfileReleaseAlertDialogProps,
} from './aragonProfileReleaseAlertDialog';
