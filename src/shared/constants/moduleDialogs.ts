import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { AssetSelectionDialog } from '@/shared/dialogs/assetSelectionDialog/assetSelectionDialog';

export enum SharedDialogs {
    ASSET_SELECTION = ' ASSET_SELECTION',
}

export const sharedDialogs: Record<SharedDialogs, IDialogComponentDefinitions> = {
    [SharedDialogs.ASSET_SELECTION]: {
        Component: AssetSelectionDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
    },
};
