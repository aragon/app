import { generateProposal } from '@/modules/governance/testUtils';
import type { ISppProposal } from '../../types';
import { generateSppPluginSettings } from './sppSettings';
import { generateSppStage } from './sppStage';

export const generateSppProposal = (
    proposal?: Partial<ISppProposal>,
): ISppProposal => ({
    ...generateProposal(proposal),
    stageIndex: 0,
    lastStageTransition: 0,
    subProposals: [],
    settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
    stageExecutions: [],
    ...proposal,
});
