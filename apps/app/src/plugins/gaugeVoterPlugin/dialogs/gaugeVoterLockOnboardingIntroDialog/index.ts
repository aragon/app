import dynamic from 'next/dynamic';

export const GaugeVoterLockOnboardingIntroDialog = dynamic(() =>
    import('./gaugeVoterLockOnboardingIntroDialog').then(
        (mod) => mod.GaugeVoterLockOnboardingIntroDialog,
    ),
);
