import dynamic from 'next/dynamic';

export const CapitalDistributorSelectCampaignDialog = dynamic(() =>
    import('./capitalDistributorSelectCampaignDialog').then(
        (mod) => mod.CapitalDistributorSelectCampaignDialog,
    ),
);

export type {
    ICapitalDistributorSelectCampaignDialogParams,
    ICapitalDistributorSelectCampaignDialogProps,
} from './capitalDistributorSelectCampaignDialog';
