import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import {
    type ICompositeAddress,
    type IProposalActionChangeMembers as IOdsProposalActionChangeMembers,
} from '@aragon/ods';

export interface IProposalActionChangeMembers extends Omit<IOdsProposalActionChangeMembers, 'type' | 'currentMembers'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.MULTISIG_ADD_MEMBERS | ProposalActionType.MULTISIG_REMOVE_MEMBERS;
    /**
     * The current members of the DAO.
     */
    currentMembers: ICompositeAddress[];
}
