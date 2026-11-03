import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { MultisigProposalActionType } from './enum';

export interface IMultisigActionChangeMembersMember {
    /**
     * The address of the member.
     */
    address: string;
    /**
     * The ENS name of the member.
     */
    ens?: string;
    /**
     * The avatar URL of the member.
     */
    avatar?: string;
}

export interface IMultisigActionChangeMembers extends IProposalAction {
    /**
     * The type of the proposal action.
     */
    type:
        | MultisigProposalActionType.MULTISIG_ADD_MEMBERS
        | MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS;
    /**
     * The members added or removed by the action.
     */
    members: IMultisigActionChangeMembersMember[];
    /**
     * The number of members of the plugin when the proposal was created.
     */
    currentMembers: number;
}
