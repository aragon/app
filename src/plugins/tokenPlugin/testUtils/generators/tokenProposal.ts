import { generateToken } from '@/modules/finance/testUtils';
import { generateProposal } from '@/modules/governance/testUtils';
import type { ITokenProposal } from '../../types';
import { generateDaoTokenSettings } from './daoTokenSettings';

export const generateTokenProposal = (proposal?: Partial<ITokenProposal>): ITokenProposal => ({
    ...generateProposal(),
    settings: generateDaoTokenSettings().settings,
    token: generateToken(),
    metrics: { votesByOption: [] },
    ...proposal,
});
