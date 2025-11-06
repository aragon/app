import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenApproveNftDialog } from '../dialogs/tokenApproveNftDialog';
import { TokenApproveTokensDialog } from '../dialogs/tokenApproveTokensDialog';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import { TokenExitQueueWithdrawDialog } from '../dialogs/tokenExitQueueWithdrawDialog';
import { TokenExitQueueWithdrawTransactionDialog } from '../dialogs/tokenExitQueueWithdrawTransactionDialog';
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
    [TokenPluginDialogId.EXIT_QUEUE_WITHDRAW_FEE]: { Component: TokenExitQueueWithdrawDialog },
    [TokenPluginDialogId.EXIT_QUEUE_WITHDRAW_TRANSACTION]: { Component: TokenExitQueueWithdrawTransactionDialog },
};
