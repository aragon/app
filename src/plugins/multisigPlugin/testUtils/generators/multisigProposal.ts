import { generateProposal } from '@/modules/governance/testUtils';
import { type IMultisigProposal } from '../../types';
import { generateMultisigPluginSettings } from './multisigPluginSettings';

export const generateMultisigProposal = (proposal?: Partial<IMultisigProposal>): IMultisigProposal => ({
    ...generateProposal(),
    settings: generateMultisigPluginSettings(),
    metrics: { totalVotes: 0 },
    ...proposal,
});
