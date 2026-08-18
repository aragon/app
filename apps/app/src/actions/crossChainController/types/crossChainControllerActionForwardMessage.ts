import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { CrossChainControllerActionType } from './enum/crossChainControllerActionType';

/**
 * Decoded `inputData` for a `forwardMessage` call on the cross-chain controller. Extends the base proposal-action input
 * data with the destination chain and the sub-actions the backend decoded from the `_message` payload.
 */
export interface ICrossChainControllerActionForwardMessageInputData
    extends NonNullable<IProposalAction['inputData']> {
    /**
     * Sub-actions carried by the `_message` payload, executed as a batch on the destination chain. Populated only when
     * the backend successfully decoded the encoded `Action[]`.
     */
    actions?: IProposalAction[];
    /**
     * Standard chain id of the chain the message is forwarded to, resolved by the backend from the
     * `_destinationChainId` parameter.
     */
    destinationChainId: number;
}

export interface ICrossChainControllerActionForwardMessage
    extends Omit<IProposalAction, 'type' | 'inputData'> {
    /**
     * Discriminator for the cross-chain controller forwardMessage action.
     */
    type: CrossChainControllerActionType.CROSS_CHAIN_CONTROLLER_FORWARD_MESSAGE;
    /**
     * Decoded input data.
     */
    inputData: ICrossChainControllerActionForwardMessageInputData;
}
