import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ExecuteDialog } from '../dialogs/executeDialog';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { VoteDialog } from '../dialogs/voteDialog';
import { PublishProcessDialog } from './../dialogs/publishProcessDialog/publishProcessDialog';

export enum GovernanceDialogs {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    PUBLISH_PROCESS = 'PUBLISH_PROCESS',
    VOTE = 'VOTE',
    EXECUTE = 'EXECUTE',
}

export const governanceDialogs: Record<GovernanceDialogs, IDialogComponentDefinitions> = {
    [GovernanceDialogs.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
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
};
