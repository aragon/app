import { providersDialogs } from '@/modules/application/components/providers/providersDialogs';
import { SafeDialogId } from './safeDialogId';

describe('safeDialogsDefinitions', () => {
    // Definitions that never reach the merged registry leave `open()` resolving to nothing, with no
    // error to notice: the button simply does nothing.
    it('reaches the merged dialog registry', () => {
        expect(providersDialogs[SafeDialogId.TRANSACTION_REVIEW]).toBeDefined();
        expect(providersDialogs[SafeDialogId.QUEUE_SLOT]).toBeDefined();
    });

    // Flagging the review dialog would make `DialogRoot` render nothing for a disconnected viewer,
    // which is exactly the read-only inspection the account queue offers.
    it('does not require a wallet to review a payload', () => {
        expect(
            providersDialogs[SafeDialogId.TRANSACTION_REVIEW].requiresWallet,
        ).toBeUndefined();
    });
});
