import dynamic from 'next/dynamic';

export const TokenWrapOnboardingIntroDialog = dynamic(() =>
    import('./tokenWrapOnboardingIntroDialog').then(
        (mod) => mod.TokenWrapOnboardingIntroDialog,
    ),
);
