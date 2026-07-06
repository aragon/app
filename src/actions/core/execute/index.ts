import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { CoreActionType } from '../types/enum/coreActionType';
import { ExecuteActionDetails } from './executeActionDetails';

export {
    ExecuteActionDetails,
    type IExecuteActionDetailsProps,
} from './executeActionDetails';

export const initExecuteActionViews = () => {
    actionViewRegistry.register({
        actionType: CoreActionType.EXECUTE,
        functionSelector: '0x3f707e6b',
        componentDetails: ExecuteActionDetails,
    });
};
