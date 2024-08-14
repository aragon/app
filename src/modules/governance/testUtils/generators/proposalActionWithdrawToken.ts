import { generateToken } from '@/modules/finance/testUtils';
import { ProposalActionType, type IProposalActionWithdrawToken } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

export const generateProposalActionWithdrawToken = (
    action?: Partial<IProposalActionWithdrawToken>,
): IProposalActionWithdrawToken => ({
    ...generateProposalAction(),
    type: ProposalActionType.TRANSFER,
    sender: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    receiver: { address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE' },
    token: generateToken(),
    amount: '0',
    ...action,
});
