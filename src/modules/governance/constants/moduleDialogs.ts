import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishProposalDialog } from '../dialogs/publishProposalDialog';

export enum GovernanceDialogs {
    PUBLISH_PROPOSAL = 'PUBLISH_PROPOSAL',
}

export const governanceDialogs: Record<GovernanceDialogs, IDialogComponentDefinitions> = {
    [GovernanceDialogs.PUBLISH_PROPOSAL]: {
        Component: PublishProposalDialog,
        title: 'todo',
        description: 'todo',
    },
};
