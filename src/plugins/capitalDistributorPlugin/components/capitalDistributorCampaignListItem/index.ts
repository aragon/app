import { CapitalDistributorCampaignListItemSkeleton } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorCampaignListItem/capitalDistributorCampaignListItemSkeleton';
import dynamic from 'next/dynamic';

export const CapitalDistributorCampaignListItem = {
    Structure: dynamic(() =>
        import('./capitalDistributorCampaignListItemStructure').then(
            (mod) => mod.CapitalDistributorCampaignListItemStructure,
        ),
    ),
    Skeleton: CapitalDistributorCampaignListItemSkeleton,
};

export { type ICapitalDistributorCampaignListItemStructureProps } from './capitalDistributorCampaignListItemStructure';
