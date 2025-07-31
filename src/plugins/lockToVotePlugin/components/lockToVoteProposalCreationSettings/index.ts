import dynamic from 'next/dynamic';

export const LockToVoteProposalCreationSettings = dynamic(() =>
    import('./lockToVoteProposalCreationSettings').then((mod) => mod.LockToVoteProposalCreationSettings),
);

export type { ILockToVoteProposalCreationSettingsProps } from './lockToVoteProposalCreationSettings';
