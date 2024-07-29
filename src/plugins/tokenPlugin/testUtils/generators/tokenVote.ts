import { generateToken } from '@/modules/finance/testUtils';
import { generateVote } from '@/modules/governance/testUtils';
import { type ITokenVote, VoteOption } from '../../types';

export const generateTokenVote = (vote?: Partial<ITokenVote>): ITokenVote => ({
    ...generateVote(),
    token: generateToken(),
    votingPower: '0',
    voteOption: VoteOption.NO,
    ...vote,
});
