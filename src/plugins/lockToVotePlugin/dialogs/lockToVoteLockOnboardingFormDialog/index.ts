import dynamic from 'next/dynamic';

export const LockToVoteLockOnboardingFormDialog = dynamic(() =>
    import('./lockToVoteLockOnboardingFormDialog').then(
        (mod) => mod.LockToVoteLockOnboardingFormDialog,
    ),
);

export type { ILockToVoteLockOnboardingFormDialogParams } from './lockToVoteLockOnboardingFormDialog.api';
