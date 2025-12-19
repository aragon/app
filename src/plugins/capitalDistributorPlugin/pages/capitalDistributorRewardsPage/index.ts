import dynamic from 'next/dynamic';

export const CapitalDistributorRewardsPage = dynamic(() =>
    import('./capitalDistributorRewardsPage').then(
        (mod) => mod.CapitalDistributorRewardsPage,
    ),
);
export type { ICapitalDistributorRewardsPageProps } from './capitalDistributorRewardsPage';
