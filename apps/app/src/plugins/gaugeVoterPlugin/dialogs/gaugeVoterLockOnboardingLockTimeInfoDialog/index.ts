import dynamic from 'next/dynamic';

export const GaugeVoterLockOnboardingLockTimeInfoDialog = dynamic(() =>
    import('./gaugeVoterLockOnboardingLockTimeInfoDialog').then(
        (mod) => mod.GaugeVoterLockOnboardingLockTimeInfoDialog,
    ),
);
