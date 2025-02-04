import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AssetSelectionDialog } from '../dialogs/assetSelectionDialog/assetSelectionDialog';

export enum FinanceDialogs {
    ASSET_SELECTION = ' ASSET_SELECTION',
}

export const financeDialogs: Record<FinanceDialogs, IDialogComponentDefinitions> = {
    [FinanceDialogs.ASSET_SELECTION]: {
        Component: AssetSelectionDialog,
        hiddenDescription: 'app.finance.assetSelectionDialog.a11y.description',
    },
};
