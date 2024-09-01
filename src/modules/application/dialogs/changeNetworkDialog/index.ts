import dynamic from 'next/dynamic';

export const ChangeNetworkDialog = dynamic(() =>
    import('./changeNetworkDialog').then((mod) => mod.ChangeNetworkDialog),
);
export type { IChangeNetworkDialogParams, IChangeNetworkDialogProps } from './changeNetworkDialog';
