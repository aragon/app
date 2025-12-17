import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CapitalDistributorClaimDialog } from '../dialogs/capitalDistributorClaimDialog';
import { CapitalDistributorClaimTransactionDialog } from '../dialogs/capitalDistributorClaimTransactionDialog';
import { CapitalDistributorPluginDialogId } from './capitalDistributorPluginDialogId';

export const capitalDistributorPluginDialogsDefinitions: Record<CapitalDistributorPluginDialogId, IDialogComponentDefinitions> = {
    [CapitalDistributorPluginDialogId.CLAIM]: {
        Component: CapitalDistributorClaimDialog,
    },
    [CapitalDistributorPluginDialogId.CLAIM_TRANSACTION]: {
        Component: CapitalDistributorClaimTransactionDialog,
    },
};
