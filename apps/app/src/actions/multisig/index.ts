import { MultisigProposalActionType } from '@/plugins/multisigPlugin/types';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { MultisigChangeMembersActionDetails } from './components/multisigChangeMembersActionDetails';

export const initMultisigActionViews = () => {
    actionViewRegistry.register({
        actionType: MultisigProposalActionType.MULTISIG_ADD_MEMBERS,
        componentDetails: MultisigChangeMembersActionDetails,
    });
    actionViewRegistry.register({
        actionType: MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS,
        componentDetails: MultisigChangeMembersActionDetails,
    });
};
