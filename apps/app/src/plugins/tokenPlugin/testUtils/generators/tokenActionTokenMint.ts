import { generateToken } from '@/modules/finance/testUtils';
import { generateProposalAction } from '@/modules/governance/testUtils';
import {
    type ITokenActionTokenMint,
    TokenProposalActionType,
} from '../../types';

export const generateTokenActionTokenMint = (
    action?: Partial<ITokenActionTokenMint>,
): ITokenActionTokenMint => ({
    ...generateProposalAction(),
    type: TokenProposalActionType.MINT,
    token: generateToken({ symbol: 'PDC', decimals: 18 }),
    receivers: {
        address: '0x32c2FE388ABbB3e678D44DF6a0471086D705316a',
        currentBalance: '0',
        newBalance: '5000000000000000000',
    },
    ...action,
});
