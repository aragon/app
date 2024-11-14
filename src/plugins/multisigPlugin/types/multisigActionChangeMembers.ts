import {
    type ICompositeAddress,
    type IProposalActionChangeMembers as IGukProposalActionChangeMembers,
} from '@aragon/gov-ui-kit';
import type { MultisigProposalActionType } from './enum';

export interface IMultisigActionChangeMembers extends Omit<IGukProposalActionChangeMembers, 'type' | 'currentMembers'> {
    /**
     * The type of the proposal action.
     */
    type: MultisigProposalActionType.MULTISIG_ADD_MEMBERS | MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS;
    /**
     * The current members of the DAO.
     */
    currentMembers: ICompositeAddress[];
}
