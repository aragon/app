import { generateProposal } from '@/modules/governance/testUtils';
import type { ISppSubProposal } from '../../types';

export const generateSppSubProposal = (proposal?: Partial<ISppSubProposal>): ISppSubProposal => ({
    ...generateProposal(proposal),
    stageIndex: 0,
    endDate: 0,
    ...proposal,
});
