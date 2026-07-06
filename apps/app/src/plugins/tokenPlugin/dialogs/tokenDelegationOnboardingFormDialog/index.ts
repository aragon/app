import dynamic from 'next/dynamic';

export const TokenDelegationOnboardingFormDialog = dynamic(() =>
    import('./tokenDelegationOnboardingFormDialog').then(
        (mod) => mod.TokenDelegationOnboardingFormDialog,
    ),
);
export type { ITokenDelegationOnboardingDialogParams } from './tokenDelegationOnboardingFormDialog.api';
