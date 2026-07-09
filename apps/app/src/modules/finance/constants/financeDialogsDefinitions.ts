import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AssetSelectionDialog } from '../dialogs/assetSelectionDialog';
import { TransactionDetailDialog } from '../dialogs/transactionDetailDialog';
import { FinanceDialogId } from './financeDialogId';

export const financeDialogsDefinitions: Record<
    FinanceDialogId,
    IDialogComponentDefinitions
> = {
    [FinanceDialogId.ASSET_SELECTION]: {
        Component: AssetSelectionDialog,
        hiddenDescription: 'app.finance.assetSelectionDialog.a11y.description',
    },
    [FinanceDialogId.TRANSACTION_DETAIL]: {
        Component: TransactionDetailDialog,
        size: 'lg',
    },
};
