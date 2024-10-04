import { generateProposal } from '@/modules/governance/testUtils';
import type { ISppProposal } from '../../types';
import { generateSppPluginSettings } from './sppSettings';

export const generateSppProposal = (proposal?: Partial<ISppProposal>): ISppProposal => ({
    ...generateProposal(proposal),
    currentStageIndex: 0,
    subProposals: [],
    settings: generateSppPluginSettings(),
    ...proposal,
});
