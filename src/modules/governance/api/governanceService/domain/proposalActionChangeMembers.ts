import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import {
    type ICompositeAddress,
    type IProposalActionChangeMembers as OdsIProposalActionChangeMembers,
} from '@aragon/ods';

export interface IProposalActionChangeMembers extends Omit<OdsIProposalActionChangeMembers, 'type' | 'currentMembers'> {
    type: ProposalActionType.MULTISIG_ADD_MEMBERS | ProposalActionType.MULTISIG_REMOVE_MEMBERS;
    currentMembers: ICompositeAddress[];
}
