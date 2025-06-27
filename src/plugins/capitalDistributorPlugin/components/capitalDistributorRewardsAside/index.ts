import dynamic from 'next/dynamic';

export const CapitalDistributorRewardsAside = dynamic(() =>
    import('./capitalDistributorRewardsAside').then((mod) => mod.CapitalDistributorRewardsAside),
);
export { type ICapitalDistributorRewardsAsideProps } from './capitalDistributorRewardsAside';
