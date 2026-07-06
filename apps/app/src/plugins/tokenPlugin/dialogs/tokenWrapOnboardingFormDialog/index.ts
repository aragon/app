import dynamic from 'next/dynamic';

export const TokenWrapOnboardingFormDialog = dynamic(() =>
    import('./tokenWrapOnboardingFormDialog').then(
        (mod) => mod.TokenWrapOnboardingFormDialog,
    ),
);

export type { ITokenWrapOnboardingFormDialogParams } from './tokenWrapOnboardingFormDialog.api';
