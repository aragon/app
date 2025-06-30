import dynamic from 'next/dynamic';

export const CapitalDistributorRewardsStats = dynamic(() =>
    import('./capitalDistributorRewardsStats').then((mod) => mod.CapitalDistributorRewardsStats),
);

export { type ICapitalDistributorRewardsStatsProps } from './capitalDistributorRewardsStats';
