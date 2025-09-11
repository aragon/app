import dynamic from 'next/dynamic';

export const LockToVoteSetupMembership = dynamic(() =>
    import('./lockToVoteSetupMembership').then((mod) => mod.LockToVoteSetupMembership),
);

export type {
    ILockToVoteSetupMembershipForm,
    ILockToVoteSetupMembershipMember,
    ILockToVoteSetupMembershipProps,
} from './lockToVoteSetupMembership.api.js';
