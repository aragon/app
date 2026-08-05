import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { CrossChainControllerExecuteActionDetails } from './components/crossChainControllerExecuteActionDetails';
import { CrossChainControllerActionType } from './types/enum/crossChainControllerActionType';

export const initCrossChainControllerActionViews = () => {
    actionViewRegistry.register({
        actionType: CrossChainControllerActionType.CROSS_CHAIN_EXECUTE,
        componentDetails: CrossChainControllerExecuteActionDetails,
    });
};
