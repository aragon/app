import dynamic from 'next/dynamic';

export const TokenDelegationOnboardingIntroDialog = dynamic(() =>
    import('./tokenDelegationOnboardingIntroDialog').then(
        (mod) => mod.TokenDelegationOnboardingIntroDialog,
    ),
);
