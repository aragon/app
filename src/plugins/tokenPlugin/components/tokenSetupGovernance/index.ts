import dynamic from 'next/dynamic';

export const TokenSetupGovernance = dynamic(() =>
    import('./tokenSetupGovernance').then((mod) => mod.TokenSetupGovernance),
);

export type { ITokenSetupGovernanceForm, ITokenSetupGovernanceProps } from './tokenSetupGovernance.api';
