import dynamic from 'next/dynamic';

export const TokenGovernanceInfo = dynamic(() =>
    import('./tokenGovernanceInfo').then((mod) => mod.TokenGovernanceInfo),
);
export type { ITokenGovernanceInfoProps } from './tokenGovernanceInfo';
