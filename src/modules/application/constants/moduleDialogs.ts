import { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ConnectWalletDialog } from '../dialogs/connectWalletDialog';

export enum ApplicationDialog {
    CONNECT_WALLET = 'CONNECT_WALLET',
}

export const applicationDialogs: Record<ApplicationDialog, IDialogComponentDefinitions> = {
    [ApplicationDialog.CONNECT_WALLET]: {
        Component: ConnectWalletDialog,
        title: 'Connect wallet',
        description: 'Connect your wallet to Aragon App',
    },
};
