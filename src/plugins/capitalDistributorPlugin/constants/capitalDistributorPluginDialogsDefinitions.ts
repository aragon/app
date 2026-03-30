import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CapitalDistributorPluginDialogId } from './capitalDistributorPluginDialogId';

export const capitalDistributorPluginDialogsDefinitions: Record<
    CapitalDistributorPluginDialogId,
    IDialogComponentDefinitions
> = {
    [CapitalDistributorPluginDialogId.CLAIM]: {
        Component: dynamic(() =>
            import('../dialogs/capitalDistributorClaimDialog').then(
                (m) => m.CapitalDistributorClaimDialog,
            ),
        ),
    },
    [CapitalDistributorPluginDialogId.CLAIM_TRANSACTION]: {
        Component: dynamic(() =>
            import('../dialogs/capitalDistributorClaimTransactionDialog').then(
                (m) => m.CapitalDistributorClaimTransactionDialog,
            ),
        ),
    },
};
