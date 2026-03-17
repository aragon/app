import dynamic from 'next/dynamic';

export const LockToVoteLockOnboardingIntroDialog = dynamic(() =>
    import('./lockToVoteLockOnboardingIntroDialog').then(
        (mod) => mod.LockToVoteLockOnboardingIntroDialog,
    ),
);
