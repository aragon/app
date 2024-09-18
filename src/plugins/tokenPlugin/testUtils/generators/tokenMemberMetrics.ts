import { generateMemberMetrics } from '@/modules/governance/testUtils';
import { ITokenMemberMetrics } from '../../types';

export const generateTokenMemberMetrics = (metrics?: Partial<ITokenMemberMetrics>): ITokenMemberMetrics => ({
    ...generateMemberMetrics(),
    delegateReceivedCount: 0,
    ...metrics,
});
