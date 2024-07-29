import { generateToken } from '@/modules/finance/testUtils';
import { type ITokenVote, VoteOption } from '../../types';

export const generateTokenVote = (vote?: Partial<ITokenVote>): ITokenVote => ({
    token: generateToken(),
    votingPower: '0',
    voteOption: VoteOption.NO,
    transactionHash: '0x123',
    blockTimestamp: 0,
    memberAddress: '0x123',
    ...vote,
});
