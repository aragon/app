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
    /**
     * Gas the destination chain may spend executing the message, as a decimal string. Obtained by
     * simulating the delivery, and cleared whenever the destination or the actions change so a stale
     * figure can never reach the proposal.
     */
    gasLimit?: string;
}
