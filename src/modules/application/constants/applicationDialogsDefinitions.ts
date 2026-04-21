import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AragonProfileClaimSubdomainDialog } from '../dialogs/aragonProfileClaimSubdomainDialog';
import { AragonProfileDialog } from '../dialogs/aragonProfileDialog';
import { AragonProfileIntroDialog } from '../dialogs/aragonProfileIntroDialog';
import { AragonProfileSetPrimaryEnsTransactionDialog } from '../dialogs/aragonProfileSetPrimaryEnsTransactionDialog';
import { AragonProfileSubdomainRegisterTransactionDialog } from '../dialogs/aragonProfileSubdomainRegisterTransactionDialog';
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
        hiddenDescription:
            'app.application.aragonProfileIntroDialog.a11y.description',
        size: 'lg',
    },
    [ApplicationDialogId.ARAGON_PROFILE_CLAIM_SUBDOMAIN]: {
        Component: AragonProfileClaimSubdomainDialog,
        hiddenTitle:
            'app.application.aragonProfileClaimSubdomainDialog.a11y.title',
        hiddenDescription:
            'app.application.aragonProfileClaimSubdomainDialog.a11y.description',
    },
    [ApplicationDialogId.ARAGON_PROFILE_SUBDOMAIN_REGISTER_TRANSACTION]: {
        Component: AragonProfileSubdomainRegisterTransactionDialog,
        hiddenTitle:
            'app.application.aragonProfileSubdomainRegisterTransactionDialog.a11y.title',
        hiddenDescription:
            'app.application.aragonProfileSubdomainRegisterTransactionDialog.a11y.description',
    },
    [ApplicationDialogId.ARAGON_PROFILE_SET_PRIMARY_ENS_TRANSACTION]: {
        Component: AragonProfileSetPrimaryEnsTransactionDialog,
        hiddenTitle:
            'app.application.aragonProfileSetPrimaryEnsTransactionDialog.a11y.title',
        hiddenDescription:
            'app.application.aragonProfileSetPrimaryEnsTransactionDialog.a11y.description',
    },
    [ApplicationDialogId.ARAGON_PROFILE]: {
        Component: AragonProfileDialog,
        hiddenDescription:
            'app.application.aragonProfileDialog.a11y.description',
        size: 'lg',
    },
    [ApplicationDialogId.ARAGON_PROFILE_UPDATE]: {
        Component: AragonProfileUpdateTransactionDialog,
        hiddenDescription:
            'app.application.aragonProfileUpdateTransactionDialog.a11y.description',
    },
};
