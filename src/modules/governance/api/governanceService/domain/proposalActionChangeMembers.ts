import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import {
    type ICompositeAddress,
    type IProposalActionChangeMembers as OdsIProposalActionChangeMembers,
} from '@aragon/ods';

export interface IProposalActionChangeMembers extends Omit<OdsIProposalActionChangeMembers, 'type' | 'currentMembers'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.MULTISIG_ADD_MEMBERS | ProposalActionType.MULTISIG_REMOVE_MEMBERS;
    /**
     * The current members of the DAO.
     */
    currentMembers: ICompositeAddress[];
}
