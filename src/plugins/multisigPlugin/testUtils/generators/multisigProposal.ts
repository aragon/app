import { generateProposal } from '@/modules/governance/testUtils';
import { type IMultisigProposal } from '../../types';
import { generateDaoMultisigSettings } from './daoMultisigSettings';

export const generateMultisigProposal = (proposal?: Partial<IMultisigProposal>): IMultisigProposal => ({
    ...generateProposal(),
    settings: generateDaoMultisigSettings(),
    metrics: { totalVotes: 0 },
    ...proposal,
});
