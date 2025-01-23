import dynamic from 'next/dynamic';

export const WalletConnectActionDialog = dynamic(() =>
    import('./walletConnectActionDialog').then((mod) => mod.WalletConnectActionDialog),
);

export type { IWalletConnectActionDialog, IWalletConnectActionDialogParams } from './walletConnectActionDialog';
