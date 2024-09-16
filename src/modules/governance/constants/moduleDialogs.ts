import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { VoteOnProposalDialog } from '../dialogs/voteOnProposalDialog';

export enum GovernanceDialogs {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    VOTE_ON_PROPOSAL = 'VOTE_ON_PROPOSAL',
}

export const governanceDialogs: Record<GovernanceDialogs, IDialogComponentDefinitions> = {
    [GovernanceDialogs.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
    },
    [GovernanceDialogs.VOTE_ON_PROPOSAL]: {
        Component: VoteOnProposalDialog,
        title: 'app.governance.VoteOnProposalDialog.title',
        description: 'app.governance.VoteOnProposalDialog.description',
    },
};
