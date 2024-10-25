import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ExecuteDialog } from '../dialogs/executeDialog';
import { PrepareProcessDialog } from '../dialogs/prepareProcessDialog';
import { PublishProcessDialog } from '../dialogs/publishProcessDialog';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { SelectPluginDialog } from '../dialogs/selectPluginDialog';
import { VoteDialog } from '../dialogs/voteDialog';

export enum GovernanceDialogs {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    PREPARE_PROCESS = 'PREPARE_PROCESS',
    PUBLISH_PROCESS = 'PUBLISH_PROCESS',
    VOTE = 'VOTE',
    EXECUTE = 'EXECUTE',
    SELECT_PLUGIN = 'SELECT_PLUGIN',
}

export const governanceDialogs: Record<GovernanceDialogs, IDialogComponentDefinitions> = {
    [GovernanceDialogs.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
    },
    [GovernanceDialogs.PREPARE_PROCESS]: {
        Component: PrepareProcessDialog,
        title: 'app.governance.prepareProcessDialog.title',
        description: 'app.governance.prepareProcessDialog.description',
    },
    [GovernanceDialogs.PUBLISH_PROCESS]: {
        Component: PublishProcessDialog,
        title: 'app.governance.publishProcessDialog.title',
        description: 'app.governance.publishProcessDialog.description',
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
};
