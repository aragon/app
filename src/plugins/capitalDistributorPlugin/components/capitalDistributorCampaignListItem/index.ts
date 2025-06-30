import dynamic from 'next/dynamic';

export const CapitalDistributorCampaignListItem = {
    Structure: dynamic(() =>
        import('./capitalDistributorCampaignListItemStructure').then(
            (mod) => mod.CapitalDistributorCampaignListItemStructure,
        ),
    ),
    Skeleton: dynamic(() =>
        import('./capitalDistributorCampaignListItemSkeleton').then(
            (mod) => mod.CapitalDistributorCampaignListItemSkeleton,
        ),
    ),
};

export { type ICapitalDistributorCampaignListItemStructureProps } from './capitalDistributorCampaignListItemStructure';
