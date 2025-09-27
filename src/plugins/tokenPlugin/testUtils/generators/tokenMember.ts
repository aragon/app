import { generateMember } from '@/modules/governance/testUtils';
import type { ITokenMember } from '../../types';
import { generateTokenMemberMetrics } from './tokenMemberMetrics';

export const generateTokenMember = (member?: Partial<ITokenMember>): ITokenMember => ({
    ...generateMember(),
    type: 'token-voting',
    votingPower: '0',
    tokenBalance: '0',
    metrics: generateTokenMemberMetrics(),
    ...member,
});
