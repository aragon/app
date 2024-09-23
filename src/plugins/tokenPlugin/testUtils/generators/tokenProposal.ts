import { generateProposal } from '@/modules/governance/testUtils';
import type { ITokenProposal } from '../../types';
import { generateDaoTokenSettings } from './daoTokenSettings';

export const generateTokenProposal = (proposal?: Partial<ITokenProposal>): ITokenProposal => ({
    ...generateProposal(),
    settings: generateDaoTokenSettings(),
    metrics: { votesByOption: [] },
    ...proposal,
});
