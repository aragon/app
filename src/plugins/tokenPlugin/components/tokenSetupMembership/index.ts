import dynamic from 'next/dynamic';

export const TokenSetupMembership = dynamic(() =>
    import('./tokenSetupMembership').then((mod) => mod.TokenSetupMembership),
);

export type { ITokenSetupMembershipProps } from './tokenSetupMembership';
