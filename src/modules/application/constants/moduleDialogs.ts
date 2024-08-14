import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ConnectWalletDialog } from '../dialogs/connectWalletDialog';

export enum ApplicationDialog {
    CONNECT_WALLET = 'CONNECT_WALLET',
}

export const applicationDialogs: Record<ApplicationDialog, IDialogComponentDefinitions> = {
    [ApplicationDialog.CONNECT_WALLET]: {
        Component: ConnectWalletDialog,
        title: 'app.application.connectWalletDialog.screenReader.title',
        description: 'app.application.connectWalletDialog.screenReader.description',
    },
};
