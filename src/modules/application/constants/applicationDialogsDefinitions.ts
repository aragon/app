import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AragonProfileClaimSubdomainDialog } from '../dialogs/aragonProfileClaimSubdomainDialog';
import { AragonProfileDialog } from '../dialogs/aragonProfileDialog';
import { AragonProfileIntroDialog } from '../dialogs/aragonProfileIntroDialog';
import { AragonProfileUpdateTransactionDialog } from '../dialogs/aragonProfileUpdateTransactionDialog';
import { ConnectWalletDialog } from '../dialogs/connectWalletDialog';
import { UserDialog } from '../dialogs/userDialog';
import { ApplicationDialogId } from './applicationDialogId';

export const applicationDialogsDefinitions: Record<
    ApplicationDialogId,
    IDialogComponentDefinitions
> = {
    [ApplicationDialogId.CONNECT_WALLET]: {
        Component: ConnectWalletDialog,
        hiddenTitle: 'app.application.connectWalletDialog.a11y.title',
        hiddenDescription:
            'app.application.connectWalletDialog.a11y.description',
        useFocusTrap: false,
    },
    [ApplicationDialogId.USER]: {
        Component: UserDialog,
        hiddenTitle: 'app.application.userDialog.a11y.title',
        hiddenDescription: 'app.application.userDialog.a11y.description',
    },
    [ApplicationDialogId.ARAGON_PROFILE_INTRO]: {
        Component: AragonProfileIntroDialog,
        hiddenTitle: 'app.application.aragonProfileIntroDialog.a11y.title',
        size: 'lg',
    },
    [ApplicationDialogId.ARAGON_PROFILE_CLAIM_SUBDOMAIN]: {
        Component: AragonProfileClaimSubdomainDialog,
        hiddenTitle:
            'app.application.aragonProfileClaimSubdomainDialog.a11y.title',
    },
    [ApplicationDialogId.ARAGON_PROFILE]: {
        Component: AragonProfileDialog,
        hiddenDescription:
            'app.application.aragonProfileDialog.a11y.description',
    },
    [ApplicationDialogId.ARAGON_PROFILE_UPDATE]: {
        Component: AragonProfileUpdateTransactionDialog,
        hiddenDescription:
            'app.application.aragonProfileUpdateTransactionDialog.a11y.description',
    },
};
