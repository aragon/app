import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CapitalDistributorCampaignUploadDialog } from '../dialogs/capitalDistributorCampaignUploadDialog';
import { CapitalDistributorSelectCampaignDialog } from '../dialogs/capitalDistributorSelectCampaignDialog';
import { CapitalDistributorDialogId } from './capitalDistributorDialogId';

export const capitalDistributorDialogsDefinitions: Record<
    CapitalDistributorDialogId,
    IDialogComponentDefinitions
> = {
    [CapitalDistributorDialogId.CAMPAIGN_UPLOAD_STATUS]: {
        Component: CapitalDistributorCampaignUploadDialog,
    },
    [CapitalDistributorDialogId.SELECT_CAMPAIGN]: {
        Component: CapitalDistributorSelectCampaignDialog,
    },
};
