import dynamic from 'next/dynamic';

export const AragonProfileIntroDialog = dynamic(() =>
    import('./aragonProfileIntroDialog').then(
        (mod) => mod.AragonProfileIntroDialog,
    ),
);

export type {
    IAragonProfileIntroDialogParams,
    IAragonProfileIntroDialogProps,
} from './aragonProfileIntroDialog';
