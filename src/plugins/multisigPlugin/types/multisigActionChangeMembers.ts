import { type IProposalActionChangeMembers as IGukProposalActionChangeMembers } from '@aragon/gov-ui-kit';
import type { MultisigProposalActionType } from './enum';

export interface IMultisigActionChangeMembers extends Omit<IGukProposalActionChangeMembers, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: MultisigProposalActionType.MULTISIG_ADD_MEMBERS | MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS;
}
