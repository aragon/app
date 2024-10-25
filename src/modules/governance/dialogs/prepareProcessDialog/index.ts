import dynamic from 'next/dynamic';

export const PrepareProcessDialog = dynamic(() =>
    import('./prepareProcessDialog').then((mod) => mod.PrepareProcessDialog),
);
export type { IPrepareProcessDialogParams, IPrepareProcessDialogProps } from './prepareProcessDialog';
