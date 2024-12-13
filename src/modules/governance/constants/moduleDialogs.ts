import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ExecuteDialog } from '../dialogs/executeDialog';
import { PermissionCheckDialog } from '../dialogs/permissionCheckDialog';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { SelectPluginDialog } from '../dialogs/selectPluginDialog';
import { VerifySmartContractDialog } from '../dialogs/verifySmartContractDialog';
import { VoteDialog } from '../dialogs/voteDialog';

export enum GovernanceDialog {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    VOTE = 'VOTE',
    EXECUTE = 'EXECUTE',
    SELECT_PLUGIN = 'SELECT_PLUGIN',
    VERIFY_SMART_CONTRACT = 'VERIFY_SMART_CONTRACT',
    PERMISSION_CHECK = 'PERMISSION_CHECK',
}

export const governanceDialogs: Record<GovernanceDialog, IDialogComponentDefinitions> = {
    [GovernanceDialog.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
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
        title: 'app.governance.permissionCheckDialog.screenReader.title', // TODO
        description: 'app.governance.permissionCheckDialog.screenReader.description', // TODO
    },
};
