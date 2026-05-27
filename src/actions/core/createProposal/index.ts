import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { CoreActionType } from '../types/enum/coreActionType';
import { CreateProposalActionDetails } from './createProposalActionDetails';

export {
    CreateProposalActionDetails,
    type ICreateProposalActionDetailsProps,
} from './createProposalActionDetails';

export const initCreateProposalActionViews = () => {
    actionViewRegistry.register({
        actionType: CoreActionType.CREATE_PROPOSAL,
        componentDetails: CreateProposalActionDetails,
    });
};
