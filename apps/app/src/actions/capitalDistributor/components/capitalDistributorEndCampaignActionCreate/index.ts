import dynamic from 'next/dynamic';

export const CapitalDistributorEndCampaignActionCreate = dynamic(() =>
    import('./capitalDistributorEndCampaignActionCreate').then(
        (mod) => mod.CapitalDistributorEndCampaignActionCreate,
    ),
);

export type { ICapitalDistributorEndCampaignActionCreateProps } from './capitalDistributorEndCampaignActionCreate';
