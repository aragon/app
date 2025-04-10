import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ConnectWalletDialog } from '../dialogs/connectWalletDialog';
import { UserDialog } from '../dialogs/userDialog';
import { ApplicationDialogId } from './applicationDialogId';

export const applicationDialogsDefinitions: Record<ApplicationDialogId, IDialogComponentDefinitions> = {
    [ApplicationDialogId.CONNECT_WALLET]: {
        Component: ConnectWalletDialog,
        hiddenTitle: 'app.application.connectWalletDialog.a11y.title',
        hiddenDescription: 'app.application.connectWalletDialog.a11y.description',
        useFocusTrap: false,
    },
    [ApplicationDialogId.USER]: {
        Component: UserDialog,
        hiddenTitle: 'app.application.userDialog.a11y.title',
        hiddenDescription: 'app.application.userDialog.a11y.description',
    },
};
