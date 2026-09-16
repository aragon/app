import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { SafeQueueSlotDialog } from '../dialogs/safeQueueSlotDialog';
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
    // Same reasoning: the disclosure is worth reading before connecting, and the action behind it
    // runs through the row's own wallet guard.
    [SafeDialogId.QUEUE_SLOT]: {
        Component: SafeQueueSlotDialog,
    },
};
