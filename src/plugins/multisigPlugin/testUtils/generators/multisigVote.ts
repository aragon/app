import { generateVote } from '@/modules/governance/testUtils';
import type { IMultisigVote } from '../../types';

export const generateMultisigVote = (vote?: Partial<IMultisigVote>): IMultisigVote => ({
    ...generateVote(),
    ...vote,
});
