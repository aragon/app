import dynamic from 'next/dynamic';

export const TokenDelegationOnboardingIntroDialog = dynamic(() =>
    import('./tokenDelegationOnboardingIntroDialog').then(
        (mod) => mod.TokenDelegationOnboardingIntroDialog,
    ),
);

export const TokenDelegationOnboardingFormDialog = dynamic(() =>
    import('./tokenDelegationOnboardingFormDialog').then(
        (mod) => mod.TokenDelegationOnboardingFormDialog,
    ),
);

export type { ITokenDelegationOnboardingDialogParams } from './tokenDelegationOnboardingDialog.api';
