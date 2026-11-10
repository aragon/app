import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { SafeCreateTransactionDialog } from '../dialogs/safeCreateTransactionDialog';
import { SafeProposalTransactionDialog } from '../dialogs/safeProposalTransactionDialog';
import { SafeTransactionDialog } from '../dialogs/safeTransactionDialog';
import { SafeTransactionReviewDialog } from '../dialogs/safeTransactionReviewDialog';
import { SafeDialogId } from './safeDialogId';

export const safeDialogsDefinitions: Record<
    SafeDialogId,
    IDialogComponentDefinitions
> = {
    // No `requiresWallet`: reading the exact payload is meaningful without a connected wallet, and
    // flagging it would render nothing at all for a disconnected viewer. Only signing needs a
    // signer, and the confirm action guards on the connection itself.
    [SafeDialogId.TRANSACTION_REVIEW]: {
        Component: SafeTransactionReviewDialog,
    },
    // Known-hash reconciliation is read-only and must survive wallet disconnection.
    // The controller guards each wallet action against its reviewed account and chain.
    [SafeDialogId.PROPOSAL_TRANSACTION]: {
        Component: SafeProposalTransactionDialog,
    },
    // Same as the proposal flow: re-checking an execution already sent is read-only and must survive wallet
    // disconnection, and every wallet action guards on the connected owner and chain itself.
    [SafeDialogId.TRANSACTION]: {
        Component: SafeTransactionDialog,
    },
    // Same again: re-checking a proposal whose submission got no answer is read-only and must survive wallet
    // disconnection, and signing guards on the connected owner and chain itself.
    [SafeDialogId.CREATE_TRANSACTION]: {
        Component: SafeCreateTransactionDialog,
    },
};
