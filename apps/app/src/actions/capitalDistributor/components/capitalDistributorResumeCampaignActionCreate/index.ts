import dynamic from 'next/dynamic';

export const CapitalDistributorResumeCampaignActionCreate = dynamic(() =>
    import('./capitalDistributorResumeCampaignActionCreate').then(
        (mod) => mod.CapitalDistributorResumeCampaignActionCreate,
    ),
);

export type { ICapitalDistributorResumeCampaignActionCreateProps } from './capitalDistributorResumeCampaignActionCreate';
