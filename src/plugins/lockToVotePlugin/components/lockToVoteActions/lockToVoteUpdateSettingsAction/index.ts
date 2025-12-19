import dynamic from 'next/dynamic';

export const LockToVoteUpdateSettingsAction = dynamic(() =>
    import('./lockToVoteUpdateSettingsAction').then(
        (mod) => mod.LockToVoteUpdateSettingsAction,
    ),
);

export type { ILockToVoteUpdateSettingsActionProps } from './lockToVoteUpdateSettingsAction';
