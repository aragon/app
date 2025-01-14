import { generateProposal } from '@/modules/governance/testUtils';
import { generateSppSubProposal } from '@/plugins/sppPlugin/testUtils/generators/sppSubProposal';
import type { ISppProposal } from '../../types';
import { generateSppPluginSettings } from './sppSettings';

export const generateSppProposal = (proposal?: Partial<ISppProposal>): ISppProposal => ({
    ...generateProposal(proposal),
    stageIndex: 0,
    lastStageTransition: 0,
    subProposals: [generateSppSubProposal()],
    settings: generateSppPluginSettings(),
    stageExecutions: [],
    ...proposal,
});
