import { generateProposalAction } from '@/modules/governance/testUtils';
import {
    type IMultisigActionChangeMembers,
    MultisigProposalActionType,
} from '../../types';

export const generateMultisigActionChangeMembers = (
    action?: Partial<IMultisigActionChangeMembers>,
): IMultisigActionChangeMembers => ({
    ...generateProposalAction(),
    type: MultisigProposalActionType.MULTISIG_ADD_MEMBERS,
    members: [],
    currentMembers: 0,
    ...action,
});
