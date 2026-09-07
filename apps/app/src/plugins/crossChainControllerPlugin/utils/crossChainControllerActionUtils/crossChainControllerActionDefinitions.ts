import { PluginContractName } from '@/shared/api/daoService/domain/enum';
import type { ICrossChainControllerActionForwardMessage } from '../../types';
import { CrossChainControllerProposalActionType } from '../../types/enum';

export const defaultForwardMessage: ICrossChainControllerActionForwardMessage =
    {
        type: CrossChainControllerProposalActionType.FORWARD_MESSAGE,
        from: '',
        to: '',
        data: '',
        value: '0',
        destinationChainId: undefined,
        nestedActions: [],
        gasLimit: undefined,
        inputData: {
            function: 'forwardMessage',
            contract: PluginContractName.CROSS_CHAIN_CONTROLLER,
            parameters: [
                {
                    name: '_destinationChainId',
                    type: 'uint256',
                    value: undefined,
                    notice: 'The standard chain id of the destination chain',
                },
                {
                    name: '_gasLimit',
                    type: 'uint256',
                    value: undefined,
                    notice: 'The gas limit used to execute the message on the destination chain',
                },
                {
                    name: '_message',
                    type: 'bytes',
                    value: undefined,
                    notice: 'The encoded actions to be executed on the destination chain',
                },
            ],
        },
    };
