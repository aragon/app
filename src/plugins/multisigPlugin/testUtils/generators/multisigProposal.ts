import { generateProposal } from '@/modules/governance/testUtils';
import { type IMultisigProposal } from '../../types';

export const generateMultisigProposal = (proposal?: Partial<IMultisigProposal>): IMultisigProposal => ({
    ...generateProposal(),
    ...proposal,
});
