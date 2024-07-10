import { generateProposal } from '@/modules/governance/testUtils';
import type { ITokenProposal } from '../../types';

export const generateTokenProposal = (proposal?: Partial<ITokenProposal>): ITokenProposal => ({
    ...generateProposal(),
    ...proposal,
});
