import dynamic from 'next/dynamic';

export const CreateDaoDetailsDialog = dynamic(() =>
    import('./createDaoDetailsDialog').then(
        (mod) => mod.CreateDaoDetailsDialog,
    ),
);

export type { ICreateDaoDetailsDialogProps } from './createDaoDetailsDialog';
