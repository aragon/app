import dynamic from 'next/dynamic';

export const CreateProcessInfoDialog = dynamic(() =>
    import('./createProcessInfoDialog').then((mod) => mod.CreateProcessInfoDialog),
);
export type { ICreateProcessInfoDialogParams, ICreateProcessInfoDialogProps } from './createProcessInfoDialog';
