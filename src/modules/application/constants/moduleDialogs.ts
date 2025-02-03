import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ConnectWalletDialog } from '../dialogs/connectWalletDialog';
import { UserDialog } from '../dialogs/userDialog';

export enum ApplicationDialog {
    CONNECT_WALLET = 'CONNECT_WALLET',
    USER = 'USER',
}

export const applicationDialogs: Record<ApplicationDialog, IDialogComponentDefinitions> = {
    [ApplicationDialog.CONNECT_WALLET]: {
        Component: ConnectWalletDialog,
        hiddenTitle: 'app.application.connectWalletDialog.a11y.title',
        hiddenDescription: 'app.application.connectWalletDialog.a11y.description',
    },
    [ApplicationDialog.USER]: {
        Component: UserDialog,
        hiddenTitle: 'app.application.userDialog.a11y.title',
        hiddenDescription: 'app.application.userDialog.a11y.description',
    },
};
