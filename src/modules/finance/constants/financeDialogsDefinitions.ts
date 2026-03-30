import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { FinanceDialogId } from './financeDialogId';

export const financeDialogsDefinitions: Record<
    FinanceDialogId,
    IDialogComponentDefinitions
> = {
    [FinanceDialogId.ASSET_SELECTION]: {
        Component: dynamic(() =>
            import('../dialogs/assetSelectionDialog/assetSelectionDialog').then(
                (m) => m.AssetSelectionDialog,
            ),
        ),
        hiddenDescription: 'app.finance.assetSelectionDialog.a11y.description',
    },
};
