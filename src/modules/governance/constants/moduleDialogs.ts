import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ExecuteDialog } from '../dialogs/executeDialog';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { VoteDialog } from '../dialogs/voteDialog';

export enum GovernanceDialogs {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    VOTE = 'VOTE',
    EXECUTE = 'EXECUTE',
}

export const governanceDialogs: Record<GovernanceDialogs, IDialogComponentDefinitions> = {
    [GovernanceDialogs.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
    },
    [GovernanceDialogs.EXECUTE]: {
        Component: ExecuteDialog,
        title: 'Execute Proposal',
        description: 'To execute the proposal you have to confirm the onchain transaction with your wallet.',
    },
    [GovernanceDialogs.VOTE]: {
        Component: VoteDialog,
        title: 'app.governance.voteDialog.title',
        description: 'app.governance.voteDialog.description',
    },
};
