import dynamic from 'next/dynamic';

export const TokenSetupMembership = dynamic(() =>
    import('./tokenSetupMembership').then((mod) => mod.TokenSetupMembership),
);

export type { ITokenSetupMembershipForm, ITokenSetupMembershipProps } from './tokenSetupMembership.api.ts';
