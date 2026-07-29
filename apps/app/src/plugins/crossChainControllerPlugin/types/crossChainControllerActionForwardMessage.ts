import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { CrossChainControllerProposalActionType } from './enum';

export interface ICrossChainControllerActionForwardMessage
    extends IProposalAction {
    /**
     * The type of the proposal action.
     */
    type: CrossChainControllerProposalActionType.FORWARD_MESSAGE;
}
