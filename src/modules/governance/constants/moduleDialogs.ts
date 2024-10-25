import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ExecuteDialog } from '../dialogs/executeDialog';
import { PermissionCheckDialog } from '../dialogs/permissionCheckDialog';
import { PrepareProcessDialog } from '../dialogs/prepareProcessDialog';
import { PublishProcessDialog } from '../dialogs/publishProcessDialog';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { SelectPluginDialog } from '../dialogs/selectPluginDialog';
import { VerifySmartContractDialog } from '../dialogs/verifySmartContractDialog';
import { VoteDialog } from '../dialogs/voteDialog';
import { WalletConnectActionDialog } from '../dialogs/walletConnectActionDialog';

export enum GovernanceDialog {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    PREPARE_PROCESS = 'PREPARE_PROCESS',
    PUBLISH_PROCESS = 'PUBLISH_PROCESS',
    VOTE = 'VOTE',
    EXECUTE = 'EXECUTE',
    SELECT_PLUGIN = 'SELECT_PLUGIN',
    VERIFY_SMART_CONTRACT = 'VERIFY_SMART_CONTRACT',
    PERMISSION_CHECK = 'PERMISSION_CHECK',
    WALLET_CONNECT_ACTION = 'WALLET_CONNECT_ACTION',
}

export const governanceDialogs: Record<GovernanceDialog, IDialogComponentDefinitions> = {
    [GovernanceDialog.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
    },
    [GovernanceDialog.PREPARE_PROCESS]: {
        Component: PrepareProcessDialog,
        title: 'app.governance.prepareProcessDialog.title',
        description: 'app.governance.prepareProcessDialog.description',
    },
    [GovernanceDialog.PUBLISH_PROCESS]: {
        Component: PublishProcessDialog,
        title: 'app.governance.publishProcessDialog.title',
        description: 'app.governance.publishProcessDialog.description',
    },
    [GovernanceDialog.EXECUTE]: {
        Component: ExecuteDialog,
        title: 'app.governance.executeDialog.title',
        description: 'app.governance.executeDialog.description',
    },
    [GovernanceDialog.VOTE]: {
        Component: VoteDialog,
        title: 'app.governance.voteDialog.title',
        description: 'app.governance.voteDialog.description',
    },
    [GovernanceDialog.SELECT_PLUGIN]: { Component: SelectPluginDialog },
    [GovernanceDialog.VERIFY_SMART_CONTRACT]: {
        Component: VerifySmartContractDialog,
        title: 'app.governance.verifySmartContractDialog.title',
        description: 'app.governance.verifySmartContractDialog.description',
        useFocusTrap: false,
    },
    [GovernanceDialog.PERMISSION_CHECK]: {
        Component: PermissionCheckDialog,
        title: 'app.governance.permissionCheckDialog.screenReader.title',
        description: 'app.governance.permissionCheckDialog.screenReader.description',
    },
    [GovernanceDialog.WALLET_CONNECT_ACTION]: {
        Component: WalletConnectActionDialog,
        title: 'app.governance.walletConnectActionDialog.connect.title',
        description: 'app.governance.walletConnectActionDialog.connect.description',
    },
};
