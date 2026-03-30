import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ApplicationDialogId } from './applicationDialogId';

export const applicationDialogsDefinitions: Record<
    ApplicationDialogId,
    IDialogComponentDefinitions
> = {
    [ApplicationDialogId.CONNECT_WALLET]: {
        Component: dynamic(() =>
            import('../dialogs/connectWalletDialog').then(
                (m) => m.ConnectWalletDialog,
            ),
        ),
        hiddenTitle: 'app.application.connectWalletDialog.a11y.title',
        hiddenDescription:
            'app.application.connectWalletDialog.a11y.description',
        useFocusTrap: false,
    },
    [ApplicationDialogId.USER]: {
        Component: dynamic(() =>
            import('../dialogs/userDialog').then((m) => m.UserDialog),
        ),
        hiddenTitle: 'app.application.userDialog.a11y.title',
        hiddenDescription: 'app.application.userDialog.a11y.description',
    },
};
