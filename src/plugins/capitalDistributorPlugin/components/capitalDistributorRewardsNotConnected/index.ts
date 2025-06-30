import dynamic from 'next/dynamic';

export const CapitalDistributorRewardsNotConnected = dynamic(
    () => import('./capitalDistributorRewardsNotConnected').then((mod) => mod.CapitalDistributorRewardsNotConnected),
    { ssr: false },
);

export { type ICapitalDistributorRewardsNotConnectedProps } from './capitalDistributorRewardsNotConnected';
