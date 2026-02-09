import dynamic from 'next/dynamic';

export const CapitalDistributorCreateCampaignActionDetails = dynamic(() =>
    import('./capitalDistributorCreateCampaignActionDetails').then(
        (mod) => mod.CapitalDistributorCreateCampaignActionDetails,
    ),
);
