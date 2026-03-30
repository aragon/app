import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CapitalDistributorDialogId } from './capitalDistributorDialogId';

export const capitalDistributorDialogsDefinitions: Record<
    CapitalDistributorDialogId,
    IDialogComponentDefinitions
> = {
    [CapitalDistributorDialogId.CAMPAIGN_UPLOAD_STATUS]: {
        Component: dynamic(() =>
            import('../dialogs/capitalDistributorCampaignUploadDialog').then(
                (m) => m.CapitalDistributorCampaignUploadDialog,
            ),
        ),
    },
    [CapitalDistributorDialogId.SELECT_CAMPAIGN]: {
        Component: dynamic(() =>
            import('../dialogs/capitalDistributorSelectCampaignDialog').then(
                (m) => m.CapitalDistributorSelectCampaignDialog,
            ),
        ),
    },
};
