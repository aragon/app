import dynamic from 'next/dynamic';

export const LockToVoteCreateProposalSettingsForm = dynamic(() =>
    import('./lockToVoteCreateProposalSettingsForm').then((mod) => mod.LockToVoteCreateProposalSettingsForm),
);
export { type ILockToVoteCreateProposalSettingsFormProps } from './lockToVoteCreateProposalSettingsForm';
