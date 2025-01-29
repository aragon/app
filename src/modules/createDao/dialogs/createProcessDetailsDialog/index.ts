import dynamic from 'next/dynamic';

export const CreateProcessDetailsDialog = dynamic(() =>
    import('./createProcessDetailsDialog').then((mod) => mod.CreateProcessDetailsDialog),
);
export type { ICreateProcessDetailsDialogParams, ICreateProcessDetailsDialogProps } from './createProcessDetailsDialog';
