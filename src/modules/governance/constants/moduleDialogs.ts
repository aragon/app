import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { PublishProposalExitDialog } from '../dialogs/publishProposalExitDialog';

export enum GovernanceDialogs {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
    EXIT_PUBLISH_PROPOSAL = 'EXIT_PUBLISH_PROPOSAL',
}

export const governanceDialogs: Record<GovernanceDialogs, IDialogComponentDefinitions> = {
    [GovernanceDialogs.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'app.governance.publishProposalDialog.title',
        description: 'app.governance.publishProposalDialog.description',
        isAlert: false,
    },
    [GovernanceDialogs.EXIT_PUBLISH_PROPOSAL]: {
        Component: PublishProposalExitDialog,
        title: 'app.governance.publishProposalExitDialog.title',
        description: 'app.governance.publishProposalExitDialog.description',
        isAlert: true,
    },
};
