import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ConnectWalletDialog } from '../dialogs/connectWalletDialog';
import { UserDialog } from '../dialogs/userInfoDialog';

export enum ApplicationDialog {
    CONNECT_WALLET = 'CONNECT_WALLET',
    USER = 'USER',
}

export const applicationDialogs: Record<ApplicationDialog, IDialogComponentDefinitions> = {
    [ApplicationDialog.CONNECT_WALLET]: {
        Component: ConnectWalletDialog,
        title: 'app.application.connectWalletDialog.screenReader.title',
        description: 'app.application.connectWalletDialog.screenReader.description',
    },
    [ApplicationDialog.USER]: {
        Component: UserDialog,
        title: 'app.application.userDialog.screenReader.title',
        description: 'app.application.userDialog.screenReader.description',
    },
};
