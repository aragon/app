import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { TokenApproveTokensDialog } from '../dialogs/tokenApproveTokensDialog';
import { TokenDelegationDialog } from '../dialogs/tokenDelegationDialog';
import { TokenWrapUnwrapDialog } from '../dialogs/tokenWrapUnwrapDialog';

export enum TokenPluginDialog {
    DELEGATE = 'DELEGATE',
    APPROVE_TOKENS = 'APPROVE_TOKENS',
    WRAP_UNWRAP = 'WRAP_UNWRAP',
}

export const tokenPluginDialogs: Record<TokenPluginDialog, IDialogComponentDefinitions> = {
    [TokenPluginDialog.DELEGATE]: { Component: TokenDelegationDialog },
    [TokenPluginDialog.APPROVE_TOKENS]: { Component: TokenApproveTokensDialog },
    [TokenPluginDialog.WRAP_UNWRAP]: { Component: TokenWrapUnwrapDialog },
};
