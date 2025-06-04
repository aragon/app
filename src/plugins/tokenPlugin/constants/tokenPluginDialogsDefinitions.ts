import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenApproveTokensDialog } from '../dialogs/tokenApproveTokensDialog';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import { TokenWrapUnwrapDialog } from '../dialogs/tokenWrapUnwrapDialog';
import { TokenPluginDialogId } from './tokenPluginDialogId';
import { TokenLockUnlockDialog } from '@/plugins/tokenPlugin/dialogs/tokenLockUnlockDialog';

export const tokenPluginDialogsDefinitions: Record<TokenPluginDialogId, IDialogComponentDefinitions> = {
    [TokenPluginDialogId.DELEGATE]: { Component: TokenDelegationDialog },
    [TokenPluginDialogId.APPROVE_TOKENS]: { Component: TokenApproveTokensDialog },
    [TokenPluginDialogId.WRAP_UNWRAP]: { Component: TokenWrapUnwrapDialog },
    [TokenPluginDialogId.LOCK_UNLOCK]: { Component: TokenLockUnlockDialog },
};
