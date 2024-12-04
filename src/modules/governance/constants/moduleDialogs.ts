import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ExecuteDialog } from '../dialogs/executeDialog';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { SelectPluginDialog } from '../dialogs/selectPluginDialog';
import { VerifySmartContractDialog } from '../dialogs/verifySmartContractDialog';
import { VoteDialog } from '../dialogs/voteDialog';

export enum GovernanceDialogs {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    VOTE = 'VOTE',
    EXECUTE = 'EXECUTE',
    SELECT_PLUGIN = 'SELECT_PLUGIN',
    VERIFY_SMART_CONTRACT = 'VERIFY_SMART_CONTRACT',
}

export const governanceDialogs: Record<GovernanceDialogs, IDialogComponentDefinitions> = {
    [GovernanceDialogs.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
    },
    [GovernanceDialogs.EXECUTE]: {
        Component: ExecuteDialog,
        title: 'app.governance.executeDialog.title',
        description: 'app.governance.executeDialog.description',
    },
    [GovernanceDialogs.VOTE]: {
        Component: VoteDialog,
        title: 'app.governance.voteDialog.title',
        description: 'app.governance.voteDialog.description',
    },
    [GovernanceDialogs.SELECT_PLUGIN]: { Component: SelectPluginDialog },
    [GovernanceDialogs.VERIFY_SMART_CONTRACT]: { Component: VerifySmartContractDialog },
};
