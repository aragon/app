import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AssetSelectionDialog } from '../dialogs/assetSelectionDialog/assetSelectionDialog';
import { FinanceDialogId } from './financeDialogId';

export const financeDialogsDefinitions: Record<FinanceDialogId, IDialogComponentDefinitions> = {
    [FinanceDialogId.ASSET_SELECTION]: {
        Component: AssetSelectionDialog,
        hiddenDescription: 'app.finance.assetSelectionDialog.a11y.description',
    },
};
