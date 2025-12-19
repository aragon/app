import dynamic from 'next/dynamic';

export const ConnectWalletDialog = dynamic(() =>
    import('./connectWalletDialog').then((mod) => mod.ConnectWalletDialog),
);
export type { IConnectWalletDialogProps } from './connectWalletDialog';
