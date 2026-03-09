import dynamic from 'next/dynamic';

export const GaugeVoterLockOnboardingFormDialog = dynamic(() =>
    import('./gaugeVoterLockOnboardingFormDialog').then(
        (mod) => mod.GaugeVoterLockOnboardingFormDialog,
    ),
);

export type { IGaugeVoterLockOnboardingFormDialogParams } from './gaugeVoterLockOnboardingFormDialog.api';
