import dynamic from 'next/dynamic';

export const UnlockBlockedInfoDialog = dynamic(() =>
    import('./unlockBlockedInfoDialog').then(
        (mod) => mod.UnlockBlockedInfoDialog,
    ),
);

export type { IUnlockBlockedInfoDialogProps } from './unlockBlockedInfoDialog';
