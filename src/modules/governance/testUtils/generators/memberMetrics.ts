import { IMemberMetrics } from '../../api/governanceService';

export const generateMemberMetrics = (metrics?: Partial<IMemberMetrics>): IMemberMetrics => ({
    firstActivity: null,
    lastActivity: null,
    ...metrics,
});
