import { generateToken } from '@/modules/finance/testUtils';
import { type IProposalActionTokenMint, ProposalActionType } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from './proposalAction';

export const generateProposalActionTokenMint = (
    action?: Partial<IProposalActionTokenMint>,
): IProposalActionTokenMint => ({
    ...generateProposalAction(),
    type: ProposalActionType.MINT,
    receivers: {
        address: '0x1',
        currentBalance: '1',
        newBalance: '1',
    },
    token: generateToken(),
    tokenSymbol: 'AAA',
    ...action,
});
