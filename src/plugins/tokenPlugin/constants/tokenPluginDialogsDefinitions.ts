import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenApproveNftDialog } from '../dialogs/tokenApproveNftDialog';
import { TokenApproveTokensDialog } from '../dialogs/tokenApproveTokensDialog';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import { TokenLocksDialog } from '../dialogs/tokenLocksDialog';
import { TokenLockUnlockDialog } from '../dialogs/tokenLockUnlockDialog';
import { TokenWrapUnwrapDialog } from '../dialogs/tokenWrapUnwrapDialog';
import { TokenPluginDialogId } from './tokenPluginDialogId';

export const tokenPluginDialogsDefinitions: Record<TokenPluginDialogId, IDialogComponentDefinitions> = {
    [TokenPluginDialogId.DELEGATE]: { Component: TokenDelegationDialog },
    [TokenPluginDialogId.APPROVE_TOKENS]: { Component: TokenApproveTokensDialog },
    [TokenPluginDialogId.APPROVE_NFT]: { Component: TokenApproveNftDialog },
    [TokenPluginDialogId.WRAP_UNWRAP]: { Component: TokenWrapUnwrapDialog },
    [TokenPluginDialogId.LOCK_UNLOCK]: { Component: TokenLockUnlockDialog },
    [TokenPluginDialogId.VIEW_LOCKS]: { Component: TokenLocksDialog },
};
