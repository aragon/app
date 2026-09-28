import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { CrossChainControllerForwardMessageDetails } from './components/crossChainControllerForwardMessageDetails';
import { CrossChainControllerActionType } from './types/enum/crossChainControllerActionType';

export const initCrossChainControllerActionViews = () => {
    actionViewRegistry.register({
        actionType:
            CrossChainControllerActionType.CROSS_CHAIN_CONTROLLER_FORWARD_MESSAGE,
        componentDetails: CrossChainControllerForwardMessageDetails,
    });
};
