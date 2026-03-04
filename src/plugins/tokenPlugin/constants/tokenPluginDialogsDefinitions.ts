import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenApproveNftDialog } from '../dialogs/tokenApproveNftDialog';
import { TokenApproveTokensDialog } from '../dialogs/tokenApproveTokensDialog';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import {
    TokenDelegationOnboardingFormDialog,
    TokenDelegationOnboardingIntroDialog,
} from '../dialogs/tokenDelegationOnboardingDialog';
import { TokenWrapUnwrapDialog } from '../dialogs/tokenWrapUnwrapDialog';
import { TokenPluginDialogId } from './tokenPluginDialogId';

export const tokenPluginDialogsDefinitions: Record<
    TokenPluginDialogId,
    IDialogComponentDefinitions
> = {
    [TokenPluginDialogId.DELEGATE]: { Component: TokenDelegationDialog },
    [TokenPluginDialogId.APPROVE_TOKENS]: {
        Component: TokenApproveTokensDialog,
    },
    [TokenPluginDialogId.APPROVE_NFT]: { Component: TokenApproveNftDialog },
    [TokenPluginDialogId.WRAP_UNWRAP]: { Component: TokenWrapUnwrapDialog },
    [TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO]: {
        Component: TokenDelegationOnboardingIntroDialog,
        hiddenTitle:
            'app.plugins.token.tokenDelegationOnboardingDialog.intro.hiddenTitle',
    },
    [TokenPluginDialogId.DELEGATION_ONBOARDING]: {
        Component: TokenDelegationOnboardingFormDialog,
    },
};
