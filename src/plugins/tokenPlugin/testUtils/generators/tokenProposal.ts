import { generateProposal } from '../../../../modules/governance/testUtils/generators/proposal';
import type { ITokenProposal } from '../../types';
import { generateTokenPluginSettings } from './tokenPluginSettings';

export const generateTokenProposal = (proposal?: Partial<ITokenProposal>): ITokenProposal => ({
    ...generateProposal(),
    settings: generateTokenPluginSettings(),
    metrics: { votesByOption: [] },
    ...proposal,
});
