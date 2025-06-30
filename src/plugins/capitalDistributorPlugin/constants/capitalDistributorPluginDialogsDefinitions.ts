import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CapitalDistributorClaimDialog } from '../dialogs/capitalDistributorClaimDialog';
import { CapitalDistributorPluginDialogId } from './capitalDistributorPluginDialogId';

export const capitalDistributorPluginDialogsDefinitions: Record<
    CapitalDistributorPluginDialogId,
    IDialogComponentDefinitions
> = {
    [CapitalDistributorPluginDialogId.CLAIM]: {
        Component: CapitalDistributorClaimDialog,
        hiddenDescription: 'app.plugins.capitalDistributor.capitalDistributorClaimDialog.a11y.description',
    },
};
