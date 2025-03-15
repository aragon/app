import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ExecuteDialog } from '../dialogs/executeDialog';
import { PermissionCheckDialog } from '../dialogs/permissionCheckDialog';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { SelectPluginDialog } from '../dialogs/selectPluginDialog';
import { VerifySmartContractDialog } from '../dialogs/verifySmartContractDialog';
import { VoteDialog } from '../dialogs/voteDialog';
import { WalletConnectActionDialog } from '../dialogs/walletConnectActionDialog';

export enum GovernanceDialog {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    VOTE = 'VOTE',
    EXECUTE = 'EXECUTE',
    SELECT_PLUGIN = 'SELECT_PLUGIN',
    VERIFY_SMART_CONTRACT = 'VERIFY_SMART_CONTRACT',
    PERMISSION_CHECK = 'PERMISSION_CHECK',
    WALLET_CONNECT_ACTION = 'WALLET_CONNECT_ACTION',
}

export const governanceDialogs: Record<GovernanceDialog, IDialogComponentDefinitions> = {
    [GovernanceDialog.PUBLISH_PROPOSAL]: { Component: PublishProposalDialog },
    [GovernanceDialog.EXECUTE]: { Component: ExecuteDialog },
    [GovernanceDialog.VOTE]: { Component: VoteDialog },
    [GovernanceDialog.SELECT_PLUGIN]: { Component: SelectPluginDialog },
    [GovernanceDialog.VERIFY_SMART_CONTRACT]: { Component: VerifySmartContractDialog, useFocusTrap: false },
    [GovernanceDialog.PERMISSION_CHECK]: {
        Component: PermissionCheckDialog,
        hiddenDescription: 'app.governance.permissionCheckDialog.a11y.description',
    },
    [GovernanceDialog.WALLET_CONNECT_ACTION]: { Component: WalletConnectActionDialog },
};
