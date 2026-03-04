import dynamic from 'next/dynamic';

export const CapitalDistributorPauseCampaignActionCreate = dynamic(() =>
    import('./capitalDistributorPauseCampaignActionCreate').then(
        (mod) => mod.CapitalDistributorPauseCampaignActionCreate,
    ),
);

export type { ICapitalDistributorPauseCampaignActionCreateProps } from './capitalDistributorPauseCampaignActionCreate';
