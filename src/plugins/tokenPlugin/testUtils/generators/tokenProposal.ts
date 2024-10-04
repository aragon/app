import { generateProposal } from '@/modules/governance/testUtils';
import type { ITokenProposal } from '../../types';
import { generateTokenPluginSettings } from './tokenPluginSettings';

export const generateTokenProposal = (proposal?: Partial<ITokenProposal>): ITokenProposal => ({
    ...generateProposal(),
    settings: generateTokenPluginSettings(),
    metrics: { votesByOption: [] },
    ...proposal,
});
