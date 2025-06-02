import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenApproveTokensDialog } from '../dialogs/tokenApproveTokensDialog';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import { TokenWrapUnwrapDialog } from '../dialogs/tokenWrapUnwrapDialog';
import { TokenPluginDialogId } from './tokenPluginDialogId';

export const tokenPluginDialogsDefinitions: Record<TokenPluginDialogId, IDialogComponentDefinitions> = {
    [TokenPluginDialogId.DELEGATE]: { Component: TokenDelegationDialog },
    [TokenPluginDialogId.APPROVE_TOKENS]: { Component: TokenApproveTokensDialog },
    [TokenPluginDialogId.WRAP_UNWRAP]: { Component: TokenWrapUnwrapDialog },
    [TokenPluginDialogId.VE_LOCKS]: { Component: TokenWrapUnwrapDialog }, // Reusing the same dialog for ve locks
};
