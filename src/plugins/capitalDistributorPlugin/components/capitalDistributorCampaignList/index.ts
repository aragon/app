import dynamic from 'next/dynamic';

export const CapitalDistributorCampaignList = dynamic(() =>
    import('./capitalDistributorCampaignList').then((mod) => mod.CapitalDistributorCampaignList),
);
export { type ICapitalDistributorCampaignListProps } from './capitalDistributorCampaignList';
