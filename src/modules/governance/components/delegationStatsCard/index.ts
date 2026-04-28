import dynamic from 'next/dynamic';

export const TokenMemberDelegationStats = dynamic(() =>
    import('./delegationStatsCard').then((mod) => mod.DelegationStatsCard),
);
export type { IDelegationStatsCardProps } from './delegationStatsCard';
