import { TokenLockUnlockDialog } from '@/plugins/tokenPlugin/dialogs/tokenLockUnlockDialog';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenLockUnlockDialog } from '..//dialogs/tokenLockUnlockDialog';
import { TokenApproveTokensDialog } from '../dialogs/tokenApproveTokensDialog';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import { TokenVeLocksDialog } from '../dialogs/tokenLocksDialog';
import { TokenWrapUnwrapDialog } from '../dialogs/tokenWrapUnwrapDialog';
import { TokenPluginDialogId } from './tokenPluginDialogId';

export const tokenPluginDialogsDefinitions: Record<TokenPluginDialogId, IDialogComponentDefinitions> = {
    [TokenPluginDialogId.DELEGATE]: { Component: TokenDelegationDialog },
    [TokenPluginDialogId.APPROVE_TOKENS]: { Component: TokenApproveTokensDialog },
    [TokenPluginDialogId.WRAP_UNWRAP]: { Component: TokenWrapUnwrapDialog },
    [TokenPluginDialogId.LOCK_UNLOCK]: { Component: TokenLockUnlockDialog },
    [TokenPluginDialogId.VIEW_LOCKS]: { Component: TokenVeLocksDialog },
};
