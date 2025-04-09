import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenApproveTokensDialog } from '../dialogs/tokenApproveTokensDialog';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import { TokenWrapUnwrapDialog } from '../dialogs/tokenWrapUnwrapDialog';
import { TokenPluginDialog } from './tokenPluginDialogId';

export const tokenPluginDialogs: Record<TokenPluginDialog, IDialogComponentDefinitions> = {
    [TokenPluginDialog.DELEGATE]: { Component: TokenDelegationDialog },
    [TokenPluginDialog.APPROVE_TOKENS]: { Component: TokenApproveTokensDialog },
    [TokenPluginDialog.WRAP_UNWRAP]: { Component: TokenWrapUnwrapDialog },
};
