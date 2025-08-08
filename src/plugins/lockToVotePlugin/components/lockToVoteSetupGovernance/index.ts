import dynamic from 'next/dynamic';

export const LockToVoteSetupGovernance = dynamic(() =>
    import('./lockToVoteSetupGovernance').then((mod) => mod.LockToVoteSetupGovernance),
);

export type { ILockToVoteSetupGovernanceForm, ILockToVoteSetupGovernanceProps } from './lockToVoteSetupGovernance.api';
