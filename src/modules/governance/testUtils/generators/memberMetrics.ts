import type { IMemberMetrics } from '../../api/governanceService';

export const generateMemberMetrics = (
    metrics?: Partial<IMemberMetrics>,
): IMemberMetrics => ({
    firstActivityTimestamp: null,
    lastActivityTimestamp: null,
    ...metrics,
});
