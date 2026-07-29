import dynamic from 'next/dynamic';

export const CapitalDistributorCampaignUploadDialog = dynamic(() =>
    import('./capitalDistributorCampaignUploadDialog').then(
        (mod) => mod.CapitalDistributorCampaignUploadDialog,
    ),
);

export type { ICapitalDistributorCampaignUploadDialogParams } from './capitalDistributorCampaignUploadDialog';
