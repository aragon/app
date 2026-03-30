import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenPluginDialogId } from './tokenPluginDialogId';

export const tokenPluginDialogsDefinitions: Record<
    TokenPluginDialogId,
    IDialogComponentDefinitions
> = {
    [TokenPluginDialogId.DELEGATE]: {
        Component: dynamic(() =>
            import('../dialogs/tokenDelegationDialog').then(
                (m) => m.TokenDelegationDialog,
            ),
        ),
    },
    [TokenPluginDialogId.APPROVE_TOKENS]: {
        Component: dynamic(() =>
            import('../dialogs/tokenApproveTokensDialog').then(
                (m) => m.TokenApproveTokensDialog,
            ),
        ),
    },
    [TokenPluginDialogId.APPROVE_NFT]: {
        Component: dynamic(() =>
            import('../dialogs/tokenApproveNftDialog').then(
                (m) => m.TokenApproveNftDialog,
            ),
        ),
    },
    [TokenPluginDialogId.WRAP_UNWRAP]: {
        Component: dynamic(() =>
            import('../dialogs/tokenWrapUnwrapDialog').then(
                (m) => m.TokenWrapUnwrapDialog,
            ),
        ),
    },
    [TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO]: {
        Component: dynamic(() =>
            import('../dialogs/tokenDelegationOnboardingIntroDialog').then(
                (m) => m.TokenDelegationOnboardingIntroDialog,
            ),
        ),
        hiddenTitle:
            'app.plugins.token.tokenDelegationOnboardingDialog.intro.hiddenTitle',
    },
    [TokenPluginDialogId.DELEGATION_ONBOARDING]: {
        Component: dynamic(() =>
            import('../dialogs/tokenDelegationOnboardingFormDialog').then(
                (m) => m.TokenDelegationOnboardingFormDialog,
            ),
        ),
    },
    [TokenPluginDialogId.WRAP_ONBOARDING_INTRO]: {
        Component: dynamic(() =>
            import('../dialogs/tokenWrapOnboardingIntroDialog').then(
                (m) => m.TokenWrapOnboardingIntroDialog,
            ),
        ),
        hiddenTitle:
            'app.plugins.token.tokenWrapOnboardingDialog.intro.hiddenTitle',
    },
    [TokenPluginDialogId.WRAP_ONBOARDING_FORM]: {
        Component: dynamic(() =>
            import('../dialogs/tokenWrapOnboardingFormDialog').then(
                (m) => m.TokenWrapOnboardingFormDialog,
            ),
        ),
    },
};
