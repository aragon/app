import type { IDaoMetrics } from '@/shared/api/daoService';

export const generateDaoMetrics = (metrics?: Partial<IDaoMetrics>): IDaoMetrics => ({
    proposalsCreated: 0,
    members: 0,
    ...metrics,
});
