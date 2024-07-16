import {
    type IProposalActionContainerProps,
    ProposalActionsContainer,
} from '@/modules/proposalActions/proposalActionsContainer/proposalActionsContainer';
import { ProposalActionsProvider } from '@/modules/proposalActions/proposalActionsContext/proposalActionsContext';

export interface IProposalActions extends IProposalActionContainerProps {}

export const ProposalActions: React.FC<IProposalActions> = (props) => (
    <ProposalActionsProvider>
        <ProposalActionsContainer {...props} />
    </ProposalActionsProvider>
);
