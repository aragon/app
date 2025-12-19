import { generateProposal } from '@/modules/governance/testUtils';
import type { ILockToVoteProposal } from '../../types';
import { generateLockToVotePluginSettings } from './lockToVotePluginSettings';

export const generateLockToVoteProposal = (
    proposal?: Partial<ILockToVoteProposal>,
): ILockToVoteProposal => ({
    ...generateProposal(),
    settings: generateLockToVotePluginSettings(),
    metrics: { votesByOption: [] },
    ...proposal,
});
