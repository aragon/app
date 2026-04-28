import dynamic from 'next/dynamic';

export const TokenMemberDelegationStats = dynamic(() =>
    import('./tokenMemberDelegationStats').then(
        (mod) => mod.TokenMemberDelegationStats,
    ),
);
export type { ITokenMemberDelegationStatsProps } from './tokenMemberDelegationStats';
