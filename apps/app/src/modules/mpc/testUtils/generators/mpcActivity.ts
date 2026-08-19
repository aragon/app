import type { IMpcActivity } from '@/modules/mpc/api/mpcService/domain';

export const generateMpcActivity = (
    activity?: Partial<IMpcActivity>,
): IMpcActivity => ({
    id: 'activity-1',
    systemId: 'system-1',
    at: '2026-01-01T00:00:00.000Z',
    actor: 'alice',
    type: 'system_created',
    ...activity,
});
