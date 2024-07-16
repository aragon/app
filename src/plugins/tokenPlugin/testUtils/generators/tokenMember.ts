import { generateMember } from '@/modules/governance/testUtils';
import type { ITokenMember } from '../../types';

export const generateTokenMember = (member?: Partial<ITokenMember>): ITokenMember => ({
    ...generateMember(),
    type: 'token-voting',
    votingPower: '0',
    tokenBalance: '0',
    ...member,
});
