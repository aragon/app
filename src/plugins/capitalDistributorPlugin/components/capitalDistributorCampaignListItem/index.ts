import dynamic from 'next/dynamic';

export const CapitalDistributorCampaignListItem = dynamic(() =>
    import('./capitalDistributorCampaignListItem').then((mod) => mod.CapitalDistributorCampaignListItem),
);
export { type ICapitalDistributorCampaignListItemProps } from './capitalDistributorCampaignListItem';
