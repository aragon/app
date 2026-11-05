import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { WithdrawTokenActionDetails } from './withdrawTokenActionDetails';

export {
    type IWithdrawTokenActionDetailsProps,
    WithdrawTokenActionDetails,
} from './withdrawTokenActionDetails';

export const initWithdrawTokenActionViews = () => {
    actionViewRegistry.register({
        actionType: ProposalActionType.TRANSFER,
        componentDetails: WithdrawTokenActionDetails,
        isDaoIndependent: true,
    });
    actionViewRegistry.register({
        actionType: ProposalActionType.TRANSFER_NATIVE,
        componentDetails: WithdrawTokenActionDetails,
        isDaoIndependent: true,
    });
};
