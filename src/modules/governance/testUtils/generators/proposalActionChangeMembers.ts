import { ProposalActionType, type IProposalActionChangeMembers } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

export const generateProposalActionChangeMembers = (
    action?: Partial<IProposalActionChangeMembers>,
): IProposalActionChangeMembers => ({
    ...generateProposalAction(),
    type: ProposalActionType.MULTISIG_ADD_MEMBERS,
    members: [{ address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }],
    currentMembers: [{ address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }],
    ...action,
});
