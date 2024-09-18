import { generateMemberMetrics } from '@/modules/governance/testUtils';
import type { ITokenMemberMetrics } from '../../types';

export const generateTokenMemberMetrics = (metrics?: Partial<ITokenMemberMetrics>): ITokenMemberMetrics => ({
    ...generateMemberMetrics(),
    delegateReceivedCount: 0,
    ...metrics,
});
