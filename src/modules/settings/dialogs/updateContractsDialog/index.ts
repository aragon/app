import dynamic from 'next/dynamic';

export const UpdateContractsDialog = dynamic(() =>
    import('./updateContractsDialog').then((mod) => mod.UpdateContractsDialog),
);
export type { IUpdateContractsDialogParams, IUpdateContractsDialogProps } from './updateContractsDialog';
