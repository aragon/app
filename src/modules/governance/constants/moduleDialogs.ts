import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';
import { ExecuteDialog } from '../dialogs/executeDialog';

export enum GovernanceDialogs {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
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
};
