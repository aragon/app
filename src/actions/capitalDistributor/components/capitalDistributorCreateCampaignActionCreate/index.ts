import dynamic from 'next/dynamic';

export const CapitalDistributorCreateCampaignActionCreate = dynamic(() =>
    import('./capitalDistributorCreateCampaignActionCreate').then(
        (mod) => mod.CapitalDistributorCreateCampaignActionCreate,
    ),
);
