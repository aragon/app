import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { MultisigProposalActionType } from './enum';

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
    members: ICompositeAddress[];
    /**
     * The number of members of the plugin when the proposal was created.
     */
    currentMembers: number;
}
