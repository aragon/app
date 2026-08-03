import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { CrossChainControllerProposalActionType } from './enum';

export interface ICrossChainControllerActionForwardMessage
    extends IProposalAction {
    /**
     * The type of the proposal action.
     */
    type: CrossChainControllerProposalActionType.FORWARD_MESSAGE;
    /**
     * Standard chain id of the chain the message is forwarded to. Must be a chain configured on the
     * cross-chain controller.
     */
    destinationChainId?: number;
    /**
     * Actions executed as a batch on the destination chain once the message is delivered. Encoded as
     * the `_message` parameter of `forwardMessage`.
     */
    nestedActions?: IProposalActionData[];
}
